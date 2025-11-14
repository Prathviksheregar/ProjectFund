"""
Smart contract synchronization utilities
"""
from web3 import Web3
import os
from dotenv import load_dotenv
from .models import Proposal, ProposalStage

load_dotenv()

# Contract configuration
CONTRACT_ADDRESS = "0x9B00068CfBF060E4aad61a892a86E98C108D760e"
RPC_URL = os.getenv('SEPOLIA_RPC_URL', 'https://eth-sepolia.g.alchemy.com/v2/9cpn2JHnxfQ1O4x2s5WIQvFKuW3JG-gM')

# Contract ABI - minimal ABI for reading proposal data
CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "_proposalId", "type": "uint256"}],
        "name": "getProposalInfo",
        "outputs": [
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "address", "name": "recipient", "type": "address"},
            {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
            {"internalType": "enum PublicFundManagement.ProposalState", "name": "state", "type": "uint8"},
            {"internalType": "uint256", "name": "publicYesVotes", "type": "uint256"},
            {"internalType": "uint256", "name": "publicNoVotes", "type": "uint256"},
            {"internalType": "uint256", "name": "currentStage", "type": "uint256"},
            {"internalType": "uint256", "name": "totalStages", "type": "uint256"},
            {"internalType": "uint256", "name": "authorityYesVotes", "type": "uint256"},
            {"internalType": "uint256", "name": "authorityNoVotes", "type": "uint256"},
            {"internalType": "uint256", "name": "publicVotingEndTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proposalCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_proposalId", "type": "uint256"},
            {"internalType": "uint256", "name": "_stageNumber", "type": "uint256"}
        ],
        "name": "getStageInfo",
        "outputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "string", "name": "report", "type": "string"},
            {"internalType": "string", "name": "aiReport", "type": "string"},
            {"internalType": "uint256", "name": "voteCount", "type": "uint256"},
            {"internalType": "enum PublicFundManagement.StageState", "name": "state", "type": "uint8"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]


def get_web3_instance():
    """Get Web3 instance connected to Sepolia"""
    try:
        web3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not web3.is_connected():
            print("❌ Failed to connect to Sepolia")
            return None
        return web3
    except Exception as e:
        print(f"❌ Error connecting to Web3: {e}")
        return None


def get_contract_instance(web3):
    """Get contract instance"""
    try:
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=CONTRACT_ABI
        )
        return contract
    except Exception as e:
        print(f"❌ Error getting contract instance: {e}")
        return None


def sync_proposal_from_blockchain(proposal_id):
    """
    Sync a single proposal from blockchain to database
    Returns: (success: bool, message: str)
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return False, "Failed to connect to blockchain"
        
        contract = get_contract_instance(web3)
        if not contract:
            return False, "Failed to get contract instance"
        
        # Get proposal data from contract
        try:
            proposal_data = contract.functions.getProposalInfo(proposal_id).call()
        except Exception as e:
            return False, f"Proposal {proposal_id} not found on blockchain: {str(e)}"
        
        # Parse proposal data (order from getProposalInfo)
        description = proposal_data[0]
        recipient = proposal_data[1]
        total_amount = Web3.from_wei(proposal_data[2], 'ether')
        state = proposal_data[3]
        public_yes = proposal_data[4]
        public_no = proposal_data[5]
        current_stage = proposal_data[6]
        total_stages = proposal_data[7]
        authority_yes = proposal_data[8]
        authority_no = proposal_data[9]
        
        # Update or create proposal in database
        proposal, created = Proposal.objects.update_or_create(
            proposal_id=proposal_id,
            defaults={
                'description': description,
                'recipient_address': recipient,
                'total_amount': total_amount,
                'current_stage': current_stage,
                'total_stages': total_stages,
                'state': state,
                'authority_yes_votes': authority_yes,
                'authority_no_votes': authority_no,
                'public_yes_votes': public_yes,
                'public_no_votes': public_no,
            }
        )
        
        # Sync stages
        for stage_num in range(1, total_stages + 1):
            try:
                stage_data = contract.functions.getStageInfo(proposal_id, stage_num).call()
                stage_amount = Web3.from_wei(stage_data[0], 'ether')
                stage_report = stage_data[1]
                stage_ai_report = stage_data[2]
                stage_vote_count = stage_data[3]
                stage_state = stage_data[4]
                
                ProposalStage.objects.update_or_create(
                    proposal=proposal,
                    stage_number=stage_num,
                    defaults={
                        'amount': stage_amount,
                        'state': stage_state,
                        'report': stage_report,
                        'ai_report': stage_ai_report,
                        'vote_count': stage_vote_count,
                    }
                )
            except Exception as e:
                print(f"⚠️ Warning: Could not sync stage {stage_num}: {e}")
        
        action = "Created" if created else "Updated"
        return True, f"{action} proposal {proposal_id} with votes: Auth({authority_yes}/{authority_no}) Public({public_yes}/{public_no})"
        
    except Exception as e:
        return False, f"Error syncing proposal {proposal_id}: {str(e)}"


def sync_all_proposals():
    """
    Sync all proposals from blockchain to database
    Returns: dict with sync results
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return {"success": False, "message": "Failed to connect to blockchain"}
        
        contract = get_contract_instance(web3)
        if not contract:
            return {"success": False, "message": "Failed to get contract instance"}
        
        # Get proposal count
        try:
            proposal_count = contract.functions.proposalCount().call()
        except Exception as e:
            return {"success": False, "message": f"Failed to get proposal count: {str(e)}"}
        
        if proposal_count == 0:
            return {"success": True, "message": "No proposals to sync", "synced": 0}
        
        # Sync each proposal
        results = {
            "success": True,
            "total": proposal_count,
            "synced": 0,
            "failed": 0,
            "details": []
        }
        
        for proposal_id in range(1, proposal_count + 1):
            success, message = sync_proposal_from_blockchain(proposal_id)
            results["details"].append({
                "proposal_id": proposal_id,
                "success": success,
                "message": message
            })
            if success:
                results["synced"] += 1
            else:
                results["failed"] += 1
        
        return results
        
    except Exception as e:
        return {"success": False, "message": f"Error syncing proposals: {str(e)}"}


def get_proposal_votes_from_contract(proposal_id):
    """
    Get just the vote counts for a specific proposal
    Returns: dict with vote counts or None if error
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return None
        
        contract = get_contract_instance(web3)
        if not contract:
            return None
        
        proposal_data = contract.functions.getProposalInfo(proposal_id).call()
        
        return {
            "proposal_id": proposal_id,
            "authority_yes": proposal_data[8],
            "authority_no": proposal_data[9],
            "public_yes": proposal_data[4],
            "public_no": proposal_data[5],
            "state": proposal_data[3]
        }
    except Exception as e:
        print(f"Error getting votes for proposal {proposal_id}: {e}")
        return None
