import React, { useEffect, useState } from "react";

"use client";
import { ProposalsList } from "@/components/PublicFundManagement/ProposalsList";
import { Dashboard } from "@/components/PublicFundManagement/Dashboard";
import { Notification } from "@/components/PublicFundManagement/Notification";
import { useWallet } from "@/hooks/useWallet";
import { useProposals } from "@/hooks/useProposals";
import { getPublicFundingContract } from "@/lib/publicFundingContract";
import { ethers } from "ethers";

export default function DashboardPage() {
  const { account, isAdmin } = useWallet();
  const { proposals } = useProposals();
  const [contractBalance, setContractBalance] = useState("0");
  const [notification, setNotification] = useState({ message: "", type: "info" });

  useEffect(() => {
    const fetchContractBalance = async () => {
      try {
        const contract = await getPublicFundingContract();
        const balance = await contract.provider.getBalance(contract.address);
        setContractBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error fetching contract balance:", error);
      }
    };

    if (account) {
      fetchContractBalance();
      setNotification({ message: "Connected to wallet!", type: "success" });
    } else {
      setNotification({ message: "Please connect your wallet", type: "warning" });
    }
  }, [account]);

  const showNotification = (message: string, type: "success" | "error" | "info" | "warning") => {
    setNotification({ message, type });
  };

  const handleError = (error: any) => {
    showNotification(error.message || "An error occurred", "error");
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Public Fund Management Dashboard</h1>
      <Notification message={notification.message} type={notification.type as any} />
      <Dashboard address={account} proposals={proposals} contractBalance={contractBalance} />
      <ProposalsList 
        proposals={proposals} 
        isAdmin={isAdmin} 
        showNotification={showNotification} 
        onError={handleError} 
      />
    </main>
  );
}
