'use client';

import { useEffect, useState } from 'react';
import AdminPanel from '@/components/AdminPanel';
import { useWallet } from '@/hooks/useWallet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Stats {
  total_proposals: number;
  active_proposals: number;
  total_funding: string;
  total_votes: number;
  recent_proposals: any[];
}

export default function AdminPage() {
  const { account, connectWallet, isAdmin, isAuthority } = useWallet();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && (isAdmin || isAuthority)) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [account, isAdmin, isAuthority]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.getContractStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Shield className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Connect your wallet to access the admin control panel
        </p>
        <Button onClick={connectWallet} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Allow both admin and authority roles
  if (!isAdmin && !isAuthority) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            <strong>Access Denied</strong>
            <p className="mt-2">
              Your wallet address ({account.slice(0, 6)}...{account.slice(-4)}) 
              does not have admin or authority privileges.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminPanel adminAddress={account} stats={stats} onRefresh={fetchStats} />
    </div>
  );
}
