import React from 'react';

export default function MetaMaskGuide() {
  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          MetaMask Required
        </h2>
        
        <p className="text-gray-600 mb-6">
          To use this Public Fund Management System, you need to install MetaMask wallet browser extension.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What is MetaMask?</h3>
          <p className="text-blue-800 text-sm">
            MetaMask is a cryptocurrency wallet and gateway to blockchain apps. 
            It allows you to interact with the Ethereum blockchain directly from your browser.
          </p>
        </div>
        
        <div className="space-y-4 text-left mb-6">
          <h3 className="font-semibold text-gray-900">Installation Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click the button below to go to MetaMask website</li>
            <li>Download the browser extension for your browser</li>
            <li>Follow the setup instructions to create a wallet</li>
            <li>Switch to Sepolia test network</li>
            <li>Return to this page and refresh</li>
          </ol>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleInstallMetaMask}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Install MetaMask
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            I've installed MetaMask - Refresh Page
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> This application works on Sepolia testnet. 
            You can get free test ETH from faucets like{' '}
            <a 
              href="https://sepoliafaucet.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Sepolia Faucet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
