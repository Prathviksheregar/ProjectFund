'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlayCircle, 
  StopCircle, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';

interface AdminStats {
  total_proposals: number;
  pending_voting: number;
  approved_proposals: number;
  running_proposals: number;
  completed_proposals: number;
  pending_bills: number;
  total_bills_verified: number;
  pending_sbt_applications: number;
}

interface SBTApplication {
  index: number;
  address: string;
  voter_hash: string;
  has_applied: boolean;
  is_registered: boolean;
}

interface Proposal {
  id: number;
  proposal_id: number;
  description: string;
  recipient: string;
  total_amount: string;
  state: string;
  state_code: number;
  current_stage: number;
  total_stages: number;
  authority_yes: number;
  authority_no: number;
  public_yes: number;
  public_no: number;
  created_at: string;
  can_close_voting: boolean;
  can_start: boolean;
}

interface Bill {
  id: number;
  proposal_id: number;
  proposal_description: string;
  stage_number: number;
  amount: string;
  bill_type: string;
  ai_verified: boolean;
  ai_confidence: number;
  ai_extracted_amount: string | null;
  ai_warnings: string[];
  file_url: string | null;
  uploaded_at: string;
}

interface RunningProposal extends Proposal {
  stages: Array<{
    stage_number: number;
    amount: string;
    state: string;
    state_code: number;
    completed_at: string | null;
    bills: Array<{
      id: number;
      bill_type: string;
      amount: string;
      approved_at: string;
    }>;
  }>;
}

export default function AdminPanel({ adminAddress }: { adminAddress: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [runningProposals, setRunningProposals] = useState<RunningProposal[]>([]);
  const [sbtApplications, setSbtApplications] = useState<SBTApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch overview stats
      const statsRes = await fetch(`${API_BASE}/admin/panel/?action=overview`);
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // Fetch proposals pending voting
      const proposalsRes = await fetch(`${API_BASE}/admin/panel/?action=proposals&state=pending_voting`);
      const proposalsData = await proposalsRes.json();
      setProposals(proposalsData);

      // Fetch pending bills
      const billsRes = await fetch(`${API_BASE}/admin/panel/?action=bills`);
      const billsData = await billsRes.json();
      setPendingBills(billsData);

      // Fetch running proposals
      const runningRes = await fetch(`${API_BASE}/admin/panel/?action=running`);
      const runningData = await runningRes.json();
      setRunningProposals(runningData);

      // Fetch SBT applications
      const sbtRes = await fetch(`${API_BASE}/admin/panel/?action=sbt_applications`);
      const sbtData = await sbtRes.json();
      setSbtApplications(sbtData);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVoting = async (proposalId: number) => {
    setActionLoading(`close_${proposalId}`);
    try {
      const response = await fetch(`${API_BASE}/admin/panel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close_voting',
          proposal_id: proposalId,
          admin_address: adminAddress
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAdminData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to close voting' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartProposal = async (proposalId: number) => {
    setActionLoading(`start_${proposalId}`);
    try {
      const response = await fetch(`${API_BASE}/admin/panel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_proposal',
          proposal_id: proposalId,
          admin_address: adminAddress
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAdminData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start proposal' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveBill = async (billId: number, approved: boolean) => {
    setActionLoading(`bill_${billId}`);
    try {
      const response = await fetch(`${API_BASE}/bills/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id: billId,
          approved,
          authority_address: adminAddress,
          notes: approved ? 'Approved by admin' : 'Rejected by admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: approved ? 'Bill approved! Next stage can be released.' : 'Bill rejected.' 
        });
        fetchAdminData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process bill' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStateColor = (stateCode: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-500',
      1: 'bg-blue-500',
      2: 'bg-purple-500',
      3: 'bg-green-500',
      4: 'bg-red-500',
      5: 'bg-yellow-500',
      6: 'bg-emerald-500'
    };
    return colors[stateCode] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
        <Button onClick={fetchAdminData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_proposals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Voting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_voting || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.running_proposals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_bills || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SBT Applications</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_sbt_applications || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="voting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voting">Pending Voting ({proposals.length})</TabsTrigger>
          <TabsTrigger value="bills">Pending Bills ({pendingBills.length})</TabsTrigger>
          <TabsTrigger value="sbt">SBT Applications ({sbtApplications.length})</TabsTrigger>
          <TabsTrigger value="running">Running Proposals ({runningProposals.length})</TabsTrigger>
        </TabsList>

        {/* Pending Voting Tab */}
        <TabsContent value="voting" className="space-y-4">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No proposals pending voting</p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Proposal #{proposal.proposal_id}</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                    <Badge className={getStateColor(proposal.state_code)}>
                      {proposal.state}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{proposal.total_amount} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stages</p>
                      <p className="font-semibold">{proposal.total_stages} stages</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Authority Votes:</span>
                      <span className="text-sm font-medium">
                        ✅ {proposal.authority_yes} / ❌ {proposal.authority_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Public Votes:</span>
                      <span className="text-sm font-medium">
                        ✅ {proposal.public_yes} / ❌ {proposal.public_no}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {proposal.can_close_voting && (
                      <Button
                        onClick={() => handleCloseVoting(proposal.proposal_id)}
                        disabled={actionLoading === `close_${proposal.proposal_id}`}
                        size="sm"
                      >
                        {actionLoading === `close_${proposal.proposal_id}`? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <StopCircle className="w-4 h-4 mr-2" />
                        )}
                        Close Voting
                      </Button>
                    )}
                    {proposal.can_start && (
                      <Button
                        onClick={() => handleStartProposal(proposal.proposal_id)}
                        disabled={actionLoading === `start_${proposal.proposal_id}`}
                        variant="secondary"
                        size="sm"
                      >
                        {actionLoading === `start_${proposal.proposal_id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <PlayCircle className="w-4 h-4 mr-2" />
                        )}
                        Start Execution
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          {pendingBills.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No bills pending approval</p>
              </CardContent>
            </Card>
          ) : (
            pendingBills.map((bill) => (
              <Card key={bill.id}>
                <CardHeader>
                  <CardTitle>Bill #{bill.id} - Proposal #{bill.proposal_id}</CardTitle>
                  <CardDescription>{bill.proposal_description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stage</p>
                      <p className="font-semibold">Stage {bill.stage_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-semibold">{bill.amount} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold capitalize">{bill.bill_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI Confidence</p>
                      <p className="font-semibold">{bill.ai_confidence}%</p>
                    </div>
                  </div>

                  {bill.ai_extracted_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">AI Extracted Amount</p>
                      <p className="font-semibold">${bill.ai_extracted_amount}</p>
                    </div>
                  )}

                  {bill.ai_warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warnings:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {bill.ai_warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {bill.file_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`http://localhost:8000${bill.file_url}`} target="_blank" rel="noopener noreferrer">
                        View Bill Document
                      </a>
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveBill(bill.id, true)}
                      disabled={actionLoading === `bill_${bill.id}`}
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Release Funds
                    </Button>
                    <Button
                      onClick={() => handleApproveBill(bill.id, false)}
                      disabled={actionLoading === `bill_${bill.id}`}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* SBT Applications Tab */}
        <TabsContent value="sbt" className="space-y-4">
          {sbtApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending SBT applications</p>
              </CardContent>
            </Card>
          ) : (
            sbtApplications.map((application) => (
              <Card key={application.index}>
                <CardHeader>
                  <CardTitle>SBT Application #{application.index + 1}</CardTitle>
                  <CardDescription>Citizen Verification Request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Applicant Address</p>
                      <p className="font-mono text-sm">{application.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Voter Hash</p>
                      <p className="font-mono text-xs break-all">{application.voter_hash}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={application.has_applied ? 'default' : 'secondary'}>
                        {application.has_applied ? 'Applied' : 'Not Applied'}
                      </Badge>
                      <Badge variant={application.is_registered ? 'default' : 'secondary'}>
                        {application.is_registered ? 'Registered' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Approve via Smart Contract:</strong>
                      <p className="mt-2 text-sm">
                        To approve this application, use MetaMask or run:<br/>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          npx hardhat run scripts/approve-sbt.js --network sepolia
                        </code>
                      </p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Running Proposals Tab */}
        <TabsContent value="running" className="space-y-4">
          {runningProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No running proposals</p>
              </CardContent>
            </Card>
          ) : (
            runningProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Proposal #{proposal.proposal_id} - Running</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                    <Badge className="bg-yellow-500">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{proposal.total_amount} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-semibold">Stage {proposal.current_stage} / {proposal.total_stages}</p>
                    </div>
                  </div>

                  {/* Stage Progress */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Stage Details:</p>
                    {proposal.stages.map((stage) => (
                      <div key={stage.stage_number} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Stage {stage.stage_number}</span>
                          <Badge variant={stage.state_code === 2 ? 'default' : 'secondary'}>
                            {stage.state}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount: {stage.amount} ETH
                        </div>
                        {stage.bills.length > 0 && (
                          <div className="text-sm">
                            <span className="text-green-600">✓ Bill Approved</span>
                            {stage.completed_at && (
                              <span className="text-muted-foreground ml-2">
                                on {new Date(stage.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
