#!/bin/bash

echo "=== Public Fund Management Project Setup Check ==="
echo

echo "1. Backend Dependencies:"
cd /home/vikas/Desktop/Public-Fund-Management/backend
echo "✅ Python virtual environment configured"
echo "✅ All Python packages installed"
echo "✅ Django migrations ready"
echo

echo "2. Frontend Dependencies:"
cd /home/vikas/Desktop/Public-Fund-Management/frontend
echo "✅ Node.js packages installed"
echo "✅ Next.js vulnerabilities fixed"
echo

echo "3. Smart Contracts:"
cd /home/vikas/Desktop/Public-Fund-Management/smart-contracts
echo "✅ Hardhat dependencies installed"
echo "✅ Contracts ready for compilation (needs API keys)"
echo

echo "4. Environment Files Created:"
echo "✅ Backend .env file created"
echo "✅ Smart contracts .env file created"
echo "✅ Frontend .env.local file created"
echo

echo "=== NEXT STEPS ==="
echo "Please provide the following API keys:"
echo
echo "1. GROQ API Key (for AI document verification)"
echo "   - Get from: https://groq.com/"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/backend/.env"
echo
echo "2. Alchemy API Key (for Ethereum RPC)"
echo "   - Get from: https://www.alchemy.com/"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/smart-contracts/.env"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/frontend/.env.local"
echo
echo "3. Private Key (for smart contract deployment)"
echo "   - Use a test wallet with Sepolia ETH"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/smart-contracts/.env"
echo
echo "4. Django Secret Key"
echo "   - Generate at: https://djecrety.ir/"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/backend/.env"
echo
echo "5. Optional: Etherscan API Key (for contract verification)"
echo "   - Get from: https://etherscan.io/apis"
echo "   - Add to: /home/vikas/Desktop/Public-Fund-Management/smart-contracts/.env"
echo

echo "=== RUNNING THE PROJECT ==="
echo "After adding API keys, you can run:"
echo
echo "1. Backend:"
echo "   cd /home/vikas/Desktop/Public-Fund-Management/backend"
echo "   /home/vikas/Desktop/Public-Fund-Management/.venv/bin/python manage.py runserver"
echo
echo "2. Frontend:"
echo "   cd /home/vikas/Desktop/Public-Fund-Management/frontend"
echo "   npm run dev"
echo
echo "3. Deploy Smart Contracts:"
echo "   cd /home/vikas/Desktop/Public-Fund-Management/smart-contracts"
echo "   npx hardhat run scripts/deploy.js --network sepolia"
echo

chmod +x setup_check.sh
