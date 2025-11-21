#!/usr/bin/env python3
"""
Add authority to PublicFundManagement contract
"""
import os
import sys
from web3 import Web3

# Configuration
PROVIDER_URL = "http://127.0.0.1:8545"
CONTRACT_ADDRESS = "0x9B00068CfBF060E4aad61a892a86E98C108D760e"
AUTHORITY_TO_ADD = "0x6459c8db925694d0b376980239ff00a2eeeba311"
ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Contract ABI
CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "authority", "type": "address"}],
        "name": "addAuthority",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "authorities",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]

def main():
    print("\n🔐 Adding Authority to PublicFundManagement Contract...\n")
    
    # Connect to provider
    w3 = Web3(Web3.HTTPProvider(PROVIDER_URL))
    
    if not w3.is_connected():
        print("❌ Error: Cannot connect to blockchain node at", PROVIDER_URL)
        print("Make sure Hardhat node is running: npx hardhat node")
        sys.exit(1)
    
    print("✅ Connected to blockchain node")
    
    # Setup account
    admin_account = w3.eth.account.from_key(ADMIN_PRIVATE_KEY)
    print(f"👤 Admin account: {admin_account.address}")
    print(f"📍 Contract: {CONTRACT_ADDRESS}")
    print(f"➕ Adding as authority: {AUTHORITY_TO_ADD}")
    
    # Get contract instance
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
    
    try:
        # Check if already an authority
        print("\n🔍 Checking current status...")
        is_authority = contract.functions.authorities(AUTHORITY_TO_ADD).call()
        
        if is_authority:
            print("✅ Already an authority!\n")
            return
        
        print("⏳ Not yet an authority, adding...\n")
        
        # Build transaction
        tx_func = contract.functions.addAuthority(AUTHORITY_TO_ADD)
        
        # Estimate gas
        gas_estimate = tx_func.estimate_gas({"from": admin_account.address})
        print(f"📊 Estimated gas: {gas_estimate}")
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(admin_account.address)
        
        # Get gas price
        gas_price = w3.eth.gas_price
        print(f"💰 Gas price: {gas_price} wei")
        
        # Build transaction
        tx_dict = tx_func.build_transaction({
            "from": admin_account.address,
            "nonce": nonce,
            "gas": gas_estimate,
            "gasPrice": gas_price,
        })
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx_dict, ADMIN_PRIVATE_KEY)
        
        # Send transaction
        print("\n📤 Sending transaction...")
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"📝 Transaction hash: {tx_hash.hex()}")
        
        # Wait for confirmation
        print("⏳ Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        
        if receipt['status'] == 1:
            print("✅ Transaction CONFIRMED!\n")
            
            # Verify
            is_authority_now = contract.functions.authorities(AUTHORITY_TO_ADD).call()
            if is_authority_now:
                print("🎉 SUCCESS! Address is now an authority!")
                print(f"✅ {AUTHORITY_TO_ADD} can now:\n")
                print("   • Create proposals")
                print("   • Approve SBT applications")
                print("   • Release funds\n")
            else:
                print("⚠️  Warning: Could not verify authority status")
        else:
            print("❌ Transaction FAILED")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
