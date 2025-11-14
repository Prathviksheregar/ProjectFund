'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSBT } from '@/hooks/useSBT';
import { Button } from '@/components/ui/button';

export default function TestSBTPage() {
  const { account, connectWallet, isConnecting } = useWallet();
  const { isRegistered, hasApplied, isLoading, applyForSBT, refreshStatus } = useSBT(account);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    const success = await applyForSBT();
    if (success) {
      // Refresh status after successful application
      setTimeout(() => {
        refreshStatus();
      }, 1000);
    }
    setIsApplying(false);
  };

  const handleRefresh = () => {
    refreshStatus();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">SBT (Soulbound Token) Test Page</h1>
      
      {/* Wallet Connection */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        {!account ? (
          <div>
            <p className="text-gray-600 mb-4">Connect your wallet to test SBT functionality</p>
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-green-600 font-medium mb-2">✅ Wallet Connected</p>
            <p className="text-sm text-gray-600">Address: {account}</p>
          </div>
        )}
      </div>

      {/* SBT Status */}
      {account && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">SBT Token Status</h2>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Registration Status</h3>
              <div className="flex items-center space-x-2">
                {isRegistered ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium">Registered Voter</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-600">Not Registered</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Application Status</h3>
              <div className="flex items-center space-x-2">
                {hasApplied ? (
                  <>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-yellow-700 font-medium">Application Submitted</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-600">No Application</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Action Required</h3>
              {isRegistered ? (
                <span className="text-green-700 font-medium">✅ Complete</span>
              ) : hasApplied ? (
                <span className="text-yellow-700 font-medium">⏳ Await Approval</span>
              ) : (
                <Button 
                  onClick={handleApply}
                  disabled={isApplying || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isApplying ? 'Applying...' : 'Apply for SBT'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">How SBT Works</h2>
        <div className="space-y-3 text-blue-700">
          <p><strong>Step 1:</strong> Connect your wallet to the application</p>
          <p><strong>Step 2:</strong> Apply for an SBT (Soulbound Token) - this creates an application</p>
          <p><strong>Step 3:</strong> Wait for an admin to approve your application</p>
          <p><strong>Step 4:</strong> Once approved, you become a registered voter and can participate in governance</p>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-100 rounded border border-yellow-300">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> This is currently using a mock SBT contract for testing purposes. 
            In production, this would interact with a real deployed smart contract on the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}