"""
SBT Contract synchronization utilities
"""
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

# SBT Contract configuration
SBT_CONTRACT_ADDRESS = "0x3F185534338d3cfC7E6D4597B74BE99e1FF9eC41"
RPC_URL = os.getenv('SEPOLIA_RPC_URL', 'https://eth-sepolia.g.alchemy.com/v2/9cpn2JHnoIv28vBZhEHxH')

# SBT Contract ABI
SBT_CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "applications",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint128", "name": "index", "type": "uint128"}],
        "name": "getApplicantByIndex",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getApplicantCount",
        "outputs": [{"internalType": "uint128", "name": "", "type": "uint128"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "applicant", "type": "address"}],
        "name": "getApplicationStatus",
        "outputs": [
            {"internalType": "bool", "name": "hasApplied", "type": "bool"},
            {"internalType": "bool", "name": "isRegistered", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "voterData",
        "outputs": [
            {"internalType": "bytes32", "name": "voterHash", "type": "bytes32"},
            {"internalType": "bool", "name": "isRegistered", "type": "bool"},
            {"internalType": "uint128", "name": "nullifier", "type": "uint128"},
            {"internalType": "uint128", "name": "tokenId", "type": "uint128"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "applicantCount",
        "outputs": [{"internalType": "uint128", "name": "", "type": "uint128"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "applicant", "type": "address"}, {"internalType": "uint128", "name": "_nullifier", "type": "uint128"}],
        "name": "approveApplication",
        "outputs": [],
        "stateMutability": "nonpayable",
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


def get_sbt_contract_instance(web3):
    """Get SBT contract instance"""
    try:
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(SBT_CONTRACT_ADDRESS),
            abi=SBT_CONTRACT_ABI
        )
        return contract
    except Exception as e:
        print(f"❌ Error getting SBT contract instance: {e}")
        return None


def get_pending_sbt_applications():
    """
    Get all pending SBT applications from blockchain
    Returns: list of applications or error dict
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return {"success": False, "message": "Failed to connect to blockchain", "applications": []}
        
        contract = get_sbt_contract_instance(web3)
        if not contract:
            return {"success": False, "message": "Failed to get SBT contract instance", "applications": []}
        
        # Get applicant count
        try:
            applicant_count = contract.functions.applicantCount().call()
        except Exception as e:
            return {"success": False, "message": f"Failed to get applicant count: {str(e)}", "applications": []}
        
        if applicant_count == 0:
            return {"success": True, "message": "No pending applications", "applications": []}
        
        # Fetch all applicants
        pending_applications = []
        
        for i in range(applicant_count):
            try:
                # Get applicant address
                applicant_address = contract.functions.getApplicantByIndex(i).call()
                
                # Check application status
                has_applied, is_registered = contract.functions.getApplicationStatus(applicant_address).call()
                
                # Only include pending applications (applied but not registered)
                if has_applied and not is_registered:
                    # Get voter hash
                    voter_hash = contract.functions.applications(applicant_address).call()
                    
                    pending_applications.append({
                        "index": i,
                        "address": applicant_address,
                        "voter_hash": voter_hash.hex() if voter_hash else "0x0",
                        "has_applied": has_applied,
                        "is_registered": is_registered
                    })
                    
            except Exception as e:
                print(f"⚠️ Warning: Could not fetch applicant {i}: {e}")
                continue
        
        return {
            "success": True,
            "total_applicants": applicant_count,
            "pending_count": len(pending_applications),
            "applications": pending_applications
        }
        
    except Exception as e:
        return {"success": False, "message": f"Error fetching SBT applications: {str(e)}", "applications": []}


def approve_sbt_application(applicant_address, nullifier, admin_private_key):
    """
    Approve an SBT application
    Returns: (success: bool, message: str, tx_hash: str)
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return False, "Failed to connect to blockchain", None
        
        contract = get_sbt_contract_instance(web3)
        if not contract:
            return False, "Failed to get SBT contract instance", None
        
        # Get admin account from private key
        try:
            admin_account = web3.eth.account.from_key(admin_private_key)
        except Exception as e:
            return False, f"Invalid private key: {str(e)}", None
        
        # Check application exists
        try:
            has_applied, is_registered = contract.functions.getApplicationStatus(applicant_address).call()
            if not has_applied:
                return False, "No application found for this address", None
            if is_registered:
                return False, "Application already approved", None
        except Exception as e:
            return False, f"Error checking application status: {str(e)}", None
        
        # Build transaction
        try:
            tx = contract.functions.approveApplication(
                Web3.to_checksum_address(applicant_address),
                nullifier
            ).build_transaction({
                'from': admin_account.address,
                'nonce': web3.eth.get_transaction_count(admin_account.address),
                'gas': 200000,
                'gasPrice': web3.eth.gas_price
            })
            
            # Sign transaction
            signed_tx = web3.eth.account.sign_transaction(tx, admin_private_key)
            
            # Send transaction
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for confirmation
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                return True, f"Application approved! SBT minted for {applicant_address}", tx_hash.hex()
            else:
                return False, "Transaction failed", tx_hash.hex()
                
        except Exception as e:
            return False, f"Transaction error: {str(e)}", None
        
    except Exception as e:
        return False, f"Error approving application: {str(e)}", None


def get_sbt_statistics():
    """
    Get SBT statistics
    Returns: dict with stats
    """
    try:
        web3 = get_web3_instance()
        if not web3:
            return None
        
        contract = get_sbt_contract_instance(web3)
        if not contract:
            return None
        
        applicant_count = contract.functions.applicantCount().call()
        
        # Count pending vs approved
        pending_count = 0
        approved_count = 0
        
        for i in range(applicant_count):
            try:
                applicant_address = contract.functions.getApplicantByIndex(i).call()
                has_applied, is_registered = contract.functions.getApplicationStatus(applicant_address).call()
                
                if has_applied and not is_registered:
                    pending_count += 1
                elif is_registered:
                    approved_count += 1
            except:
                continue
        
        return {
            "total_applicants": applicant_count,
            "pending_applications": pending_count,
            "approved_applications": approved_count
        }
        
    except Exception as e:
        print(f"Error getting SBT statistics: {e}")
        return None
