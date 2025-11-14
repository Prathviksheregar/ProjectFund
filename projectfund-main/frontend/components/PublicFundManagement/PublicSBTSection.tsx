'use client';

import { useState } from 'react';
import { useSBT } from '@/hooks/useSBT';
import { useToast } from '@/hooks/use-toast';

interface PublicSBTSectionProps {
  address: string;
}

export function PublicSBTSection({ address }: PublicSBTSectionProps) {
  const { isRegistered, hasApplied, isLoading, applyForSBT, refreshStatus } = useSBT(address);
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplying(true);
    
    try {
      console.log("Starting SBT application for address:", address);
      const success = await applyForSBT();
      
      if (success) {
        toast({
          title: "🎉 Success!",
          description: "Successfully applied for SBT token! Your application is pending approval from an admin.",
        });
        
        // Refresh status after successful application
        setTimeout(() => {
          refreshStatus();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error in handleApply:", error);
      toast({
        title: "❌ Error",
        description: "Failed to apply for SBT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRefreshStatus = () => {
    refreshStatus();
    toast({
      title: "🔄 Refreshed",
      description: "SBT status has been updated.",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">🪙 SBT Token Application</h3>
        <button
          onClick={handleRefreshStatus}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 transition-colors"
        >
          {isLoading ? '⏳ Loading...' : '🔄 Refresh Status'}
        </button>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>What is an SBT Token?</strong> A Soulbound Token (SBT) is a non-transferable identity token that verifies your eligibility to participate in governance voting and proposal management.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">📊 Current Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Registration Status:</span>
              {isRegistered ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Registered Voter
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ❌ Not Registered
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Application Status:</span>
              {hasApplied ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⏳ Pending Approval
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  📝 No Application
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">🎯 Next Steps</h4>
          
          {isRegistered ? (
            <div className="text-center">
              <div className="text-green-600 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-green-700 font-medium">
                🎉 Congratulations! You're a verified voter and can participate in all governance activities.
              </p>
            </div>
          ) : hasApplied ? (
            <div className="text-center">
              <div className="text-yellow-600 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-700 font-medium mb-2">
                ⏳ Your application is being reviewed by an admin. Please wait for approval.
              </p>
              <p className="text-xs text-gray-500">
                You will be notified once your SBT token is approved and minted.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Apply for your SBT token to become a verified voter and participate in governance.
              </p>
              <button
                onClick={handleApply}
                disabled={isApplying || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isApplying ? '⏳ Applying...' : isLoading ? '⏳ Loading...' : '📝 Apply for SBT Token'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Process Steps */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">📋 Application Process</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={`flex items-center ${!hasApplied && !isRegistered ? 'text-blue-600' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-2 text-xs">
              1
            </span>
            <span>Submit Application</span>
          </div>
          <div className={`flex items-center ${hasApplied && !isRegistered ? 'text-yellow-600' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-2 text-xs">
              2
            </span>
            <span>Admin Review</span>
          </div>
          <div className={`flex items-center ${isRegistered ? 'text-green-600' : 'text-gray-500'}`}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-2 text-xs">
              3
            </span>
            <span>Token Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}