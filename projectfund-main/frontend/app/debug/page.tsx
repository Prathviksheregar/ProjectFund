'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [metamaskStatus, setMetamaskStatus] = useState('Checking...');
  const [network, setNetwork] = useState('Checking...');
  const [accounts, setAccounts] = useState<string[]>([]);

  useEffect(() => {
    const checkMetamask = async () => {
      if (typeof window === 'undefined') {
        setMetamaskStatus('Window object not available');
        return;
      }

      if (typeof window.ethereum === 'undefined') {
        setMetamaskStatus('❌ MetaMask NOT detected. Please install MetaMask.');
        return;
      }

      setMetamaskStatus('✅ MetaMask detected');

      try {
        // Get current network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdNumber = parseInt(chainId, 16);
        
        // 31337 is Hardhat's local network ID
        if (chainIdNumber === 31337) {
          setNetwork('✅ Connected to Hardhat (Chain ID: 31337)');
        } else if (chainIdNumber === 11155111) {
          setNetwork('⚠️ Connected to Sepolia testnet (Chain ID: 11155111)');
        } else {
          setNetwork(`❌ Wrong network (Chain ID: ${chainIdNumber}). Need Chain ID: 31337 (Hardhat) or 11155111 (Sepolia)`);
        }

        // Get accounts
        const accts = await window.ethereum.request({ method: 'eth_accounts' });
        setAccounts(accts);
      } catch (err: any) {
        setMetamaskStatus(`❌ Error: ${err.message}`);
      }
    };

    checkMetamask();
  }, []);

  const handleConnect = async () => {
    try {
      const accts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(accts);
      alert('Connected: ' + accts[0]);
    } catch (err: any) {
      alert('Connection failed: ' + err.message);
    }
  };

  const handleAddHardhatNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7a69', // 31337 in hex
          chainName: 'Hardhat Local',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      });
      alert('Network added! Please refresh the page.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Wallet Debug</h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="mb-2"><strong>MetaMask:</strong> {metamaskStatus}</p>
          <p className="mb-2"><strong>Network:</strong> {network}</p>
          <p><strong>Connected Accounts:</strong> {accounts.length > 0 ? accounts[0] : 'None'}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold"
          >
            Connect MetaMask
          </button>

          <button
            onClick={handleAddHardhatNetwork}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded font-semibold"
          >
            Add Hardhat Network to MetaMask
          </button>

          <a
            href="/"
            className="block w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded font-semibold text-center"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="mt-8 bg-yellow-900 border border-yellow-700 p-4 rounded">
          <h3 className="font-semibold mb-2">⚠️ Troubleshooting:</h3>
          <ul className="text-sm space-y-1">
            <li>• Make sure MetaMask is installed and enabled</li>
            <li>• Make sure Hardhat node is running on http://127.0.0.1:8545</li>
            <li>• Try adding the Hardhat network using the button above</li>
            <li>• Refresh the page after adding the network</li>
            <li>• Check browser console for errors (F12)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
