"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { apiClient } from "@/lib/apiClient";
import { ethers } from "ethers";

interface Proposal {
  id: number;
  proposal_id: number;
  description: string;
  recipient_address: string;
  total_amount: string;
  state: number;
  state_display: string;
  current_stage: number;
  total_stages: number;
  created_at: string;
  creator_username: string;
  votes_count: number;
  funders_count: number;
  total_funded: string;
  progress_percentage: number;
  support_percentage: number;
  authority_yes_votes: number;
  authority_no_votes: number;
  public_yes_votes: number;
  public_no_votes: number;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { account } = useWallet();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("");
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProposal();
    }
  }, [params.id]);

  const fetchProposal = async () => {
    try {
      const response = await apiClient.getProposal(parseInt(params.id as string));
      setProposal(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      setLoading(false);
    }
  };

  const handleVote = async (support: boolean) => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    setVoting(true);
    try {
      await apiClient.voteProposal(proposal!.id, support);
      setUserVote(support);
      await fetchProposal();
      alert("Vote submitted successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error voting on proposal");
    } finally {
      setVoting(false);
    }
  };

  const handleFunding = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setFunding(true);
    try {
      // Generate transaction hash (in real scenario, this comes from contract interaction)
      const txHash = ethers.id(JSON.stringify({ proposal: proposal!.id, amount: fundingAmount, user: account }));
      
      await apiClient.fundProposal(proposal!.id, fundingAmount, txHash);
      setFundingAmount("");
      await fetchProposal();
      alert("Funding submitted successfully!");
    } catch (error) {
      console.error("Error funding proposal:", error);
      alert("Error funding proposal");
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading proposal details...</div>;
  }

  if (!proposal) {
    return <div className="p-8 text-center">Proposal not found</div>;
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-4">Proposal #{proposal.proposal_id}</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm text-gray-600">Target Amount</p>
          <p className="text-2xl font-bold">{parseFloat(proposal.total_amount).toFixed(2)} ETH</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-600">Funded</p>
          <p className="text-2xl font-bold">{parseFloat(proposal.total_funded).toFixed(2)} ETH</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-2xl font-bold">{proposal.state_display}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Progress</p>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(proposal.progress_percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm mt-2">{proposal.progress_percentage.toFixed(2)}% funded</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3">Description</h2>
        <p className="text-gray-700">{proposal.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Voting Section */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Voting</h3>
          <div className="space-y-2 mb-4">
            <p className="text-sm">Support: {proposal.support_percentage.toFixed(2)}%</p>
            <p className="text-sm">Total Votes: {proposal.votes_count}</p>
            <p className="text-sm">Yes Votes: {proposal.public_yes_votes}</p>
            <p className="text-sm">No Votes: {proposal.public_no_votes}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voting}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {voting ? "Voting..." : "👍 Support"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {voting ? "Voting..." : "👎 Against"}
            </button>
          </div>
        </div>

        {/* Funding Section */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Fund This Proposal</h3>
          <p className="text-sm text-gray-600 mb-4">Funders: {proposal.funders_count}</p>
          <input
            type="number"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="w-full px-4 py-2 border rounded mb-4"
            step="0.01"
            min="0"
          />
          <button
            onClick={handleFunding}
            disabled={funding || !fundingAmount}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {funding ? "Processing..." : "💰 Fund Now"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
          <div>
            <p className="text-gray-600">Recipient Address</p>
            <p className="font-mono text-xs break-all">{proposal.recipient_address}</p>
          </div>
          <div>
            <p className="text-gray-600">Current Stage</p>
            <p className="font-semibold">{proposal.current_stage}/{proposal.total_stages}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-semibold">{new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Authority Votes</p>
            <p className="font-semibold">Yes: {proposal.authority_yes_votes}, No: {proposal.authority_no_votes}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
