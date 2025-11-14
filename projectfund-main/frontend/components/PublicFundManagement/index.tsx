'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useProposals } from '@/hooks/useProposals';
import { useContractData } from '@/hooks/useContractData';
import { Dashboard } from './Dashboard';
import { AdminPanel } from './AdminPanel';
import { AuthorityPanel } from './AuthorityPanel';
import { ProposalsList } from './ProposalsList';
import { PublicVoting } from './PublicVoting';
import { StageReports } from './StageReports';
import { Header } from './Header';
import { Notification } from './Notification';
import { TabNavigation } from './TabNavigation';

export function PublicFundManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const { account, isAdmin, isAuthority, connectWallet, isConnecting } = useWallet();
  const { proposals, loadProposals } = useProposals();
  const { contractBalance, loadContractData } = useContractData();

  useEffect(() => {
    loadContractData();
    loadProposals();
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 5000);
  };

  if (!account && isConnecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Public Fund Management System...</p>
        </div>
      </div>
    );
  }

  if (!account && !isConnecting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              To access the Public Fund Management System and apply for SBT tokens, please connect your MetaMask wallet.
            </p>
          </div>
          
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Don't have MetaMask? <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download here</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header 
        account={account}
        isAdmin={isAdmin}
        isAuthority={isAuthority}
        contractBalance={contractBalance}
        onRefresh={loadContractData}
      />

      {notification && <Notification message={notification} type="success" />}
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isAuthority={isAuthority}
        proposals={proposals}
      />

      {activeTab === 'dashboard' && <Dashboard address={account} proposals={proposals} contractBalance={contractBalance} isAdmin={isAdmin} />}
      {activeTab === 'admin' && isAdmin && <AdminPanel showNotification={showNotification} onError={setError} />}
      {activeTab === 'authority' && isAuthority && <AuthorityPanel showNotification={showNotification} onError={setError} />}
      {activeTab === 'proposals' && <ProposalsList proposals={proposals} isAdmin={isAdmin} showNotification={showNotification} onError={setError} />}
      {activeTab === 'voting' && <PublicVoting proposals={proposals.filter(p => p.state === 'PublicVoting')} showNotification={showNotification} onError={setError} />}
      {activeTab === 'reports' && <StageReports proposals={proposals.filter(p => p.state === 'InProgress')} isAuthority={isAuthority} showNotification={showNotification} onError={setError} />}
    </div>
  );
}