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

  const applyForSBT = async (voterHash: string) => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Applying for SBT with hash:", voterHash);
      console.log("Using account:", account);
      
      const contract = await getSBTContract();
      console.log("Contract connected, sending transaction...");
      
      // Skip gas estimation for mock contract
      let tx;
      try {
        tx = await contract.applyForSBT(voterHash);
        console.log("Transaction sent:", tx.hash);
      } catch (txError) {
        console.error("Transaction failed:", txError);
        throw txError;
      }
      
      try {
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        toast({
          title: "Success",
          description: "Successfully applied for SBT token!",
        });
        
        setHasApplied(true);
        await checkStatus();
      } catch (confirmError) {
        console.error("Transaction confirmation failed:", confirmError);
        throw confirmError;
      }
    } catch (error) {
      console.error("Error applying for SBT:", error);
      
      let errorMessage = "Failed to apply for SBT. ";
      if (error.code === "ACTION_REJECTED") {
        errorMessage += "Transaction was rejected.";
      } else if (error.reason) {
        errorMessage += error.reason;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Check console for details.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isRegistered,
    hasApplied,
    isLoading,
    applyForSBT,
    refreshStatus: checkStatus,
  };
}
