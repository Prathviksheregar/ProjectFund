import { useState, useEffect, useCallback } from 'react';
import { getSBTContract, checkSBTStatus } from '@/lib/sbtTokenContract';
import { useToast } from "@/hooks/use-toast";

export function useSBT(account: string) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkStatus = useCallback(async () => {
    if (!account) {
      setIsLoading(false);
      return;
    }

    try {
      const { hasApplied: applied, isRegistered: registered } = await checkSBTStatus(account);
      setHasApplied(applied);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking SBT status:", error);
      toast({
        title: "Error",
        description: "Failed to check SBT status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, toast]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const applyForSBT = async (voterHash?: string) => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      // Generate a voter hash if not provided
      const finalVoterHash = voterHash || generateVoterHash(account);
      
      console.log("Applying for SBT with hash:", finalVoterHash);
      console.log("Using account:", account);
      
      const contract = await getSBTContract();
      console.log("Contract connected, sending transaction...");
      
      const tx = await contract.applyForSBT(finalVoterHash);
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Register application in backend database
      try {
        const response = await fetch('http://localhost:8000/api/sbt/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'register',
            wallet_address: account,
            voter_hash: finalVoterHash,
            tx_hash: tx.hash
          })
        });
        
        const data = await response.json();
        if (!data.success) {
          console.warn("Failed to register in backend:", data.error);
        } else {
          console.log("Application registered in backend:", data);
        }
      } catch (backendError) {
        console.error("Error registering in backend:", backendError);
        // Don't fail the whole operation if backend registration fails
      }
      
      toast({
        title: "Success",
        description: "Successfully applied for SBT token! Your application is now pending approval.",
      });
      
      // Refresh status after successful application
      await checkStatus();
      return true;
      
    } catch (error: any) {
      console.error("Error applying for SBT:", error);
      
      let errorMessage = "Failed to apply for SBT. ";
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        errorMessage += "Transaction was rejected by user.";
      } else if (error.reason) {
        errorMessage += error.reason;
      } else if (error.message && error.message.includes("already applied")) {
        errorMessage = "You have already applied for an SBT token.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again or check console for details.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate a voter hash from address
  const generateVoterHash = (address: string): string => {
    // Simple hash generation for demo purposes
    // In production, this would be more sophisticated
    const hash = Array.from(address)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .slice(2, 66); // Remove 0x and take 64 chars
    
    return '0x' + hash.padEnd(64, '0');
  };

  return {
    isRegistered,
    hasApplied,
    isLoading,
    applyForSBT,
    refreshStatus: checkStatus,
  };
}
