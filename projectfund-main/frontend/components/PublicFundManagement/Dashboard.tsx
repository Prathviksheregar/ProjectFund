'use client';

import { Proposal, ProposalState } from '@/lib/types';
import { PublicSBTSection } from './PublicSBTSection';

interface DashboardProps {
  address: string;
  proposals: Proposal[];
  contractBalance: string;
  isAdmin?: boolean;
}

export function Dashboard({address, proposals, contractBalance, isAdmin }: DashboardProps) {

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Contract Balance</h3>
          <p className="text-3xl font-bold">{contractBalance} ETH</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Proposals</h3>
          <p className="text-3xl font-bold">{proposals.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Proposals</h3>
          <p className="text-3xl font-bold">
            {proposals.filter(p =>
              p.state !== 'Rejected' && p.state !== 'Completed'
            ).length}
          </p>
        </div>
      </div>

      {/* SBT Token Application Section for Public Users Only */}
      {address && !isAdmin && <PublicSBTSection address={address} />}
      
      {/* Admin SBT Status */}
      {address && isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-2">Admin SBT Status</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              👑 Admin - Auto-approved with 1000 SBT Tokens
            </span>
          </div>
          <p className="mt-2 text-gray-600">
            As an admin, you have automatic SBT token privileges. Manage user applications in the Admin Panel.
          </p>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Proposal Status Summary</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Count</th>
            </tr>
          </thead>
          <tbody>
            {(['Created', 'UnderAuthorityVoting', 'PublicVoting', 'Approved', 'InProgress', 'Rejected', 'Completed'] as ProposalState[]).map(state => (
              <tr key={state}>
                <td className="py-2 px-4 border">{state}</td>
                <td className="py-2 px-4 border text-center">
                  {proposals.filter(p => p.state === state).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}