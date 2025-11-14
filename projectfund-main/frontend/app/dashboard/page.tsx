"use client";

import React, { useEffect, useState } from "react";
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
        // Use the contract's provider to get balance
        if (contract.target && contract.runner && contract.runner.provider) {
          const balance = await contract.runner.provider.getBalance(contract.target);
          setContractBalance(ethers.formatEther(balance));
        } else {
          // Fallback for mock implementation
          setContractBalance("1000.0");
        }
      } catch (error) {
        console.error("Error fetching contract balance:", error);
        setContractBalance("0.0");
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
        showNotification={(message: string) => showNotification(message, "info")} 
        onError={(message: string) => showNotification(message, "error")} 
      />
    </main>
  );
}
