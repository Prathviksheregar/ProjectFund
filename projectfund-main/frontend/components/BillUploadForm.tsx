'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface BillUploadProps {
  proposalId: number;
  stageNumber: number;
  expectedAmount: string;
  recipientAddress: string;
  onSuccess?: () => void;
}

export default function BillUploadForm({ 
  proposalId, 
  stageNumber, 
  expectedAmount,
  recipientAddress,
  onSuccess 
}: BillUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [billType, setBillType] = useState('receipt');
  const [amount, setAmount] = useState(expectedAmount);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('proposal_id', proposalId.toString());
      formData.append('stage_number', stageNumber.toString());
      formData.append('bill_type', billType);
      formData.append('amount', amount);
      formData.append('description', description);
      formData.append('recipient_address', recipientAddress);

      const response = await fetch('http://localhost:8000/api/bills/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult(data);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        setError(data.error || 'Failed to upload bill');
      }
    } catch (err) {
      setError('Network error - please try again');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Bill for AI Verification</CardTitle>
        <CardDescription>
          Upload bill/receipt for Stage {stageNumber} - Amount: {expectedAmount} ETH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Bill/Receipt Document *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              {file && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {file.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Supported: Images (JPG, PNG) or PDF. Max 10MB
            </p>
          </div>

          {/* Bill Type */}
          <div className="space-y-2">
            <Label htmlFor="billType">Document Type *</Label>
            <Select value={billType} onValueChange={setBillType} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={uploading}
              placeholder="0.005"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="Brief description of expenses..."
              rows={3}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <Alert
              variant={verificationResult.verification.verified ? 'default' : 'destructive'}
              className={verificationResult.verification.verified ? 'border-green-500 bg-green-50' : ''}
            >
              <div className="flex items-start gap-3">
                {verificationResult.verification.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold mb-2">
                    {verificationResult.message}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>AI Confidence:</strong> {verificationResult.verification.confidence}%
                    </div>
                    {verificationResult.verification.extracted_amount && (
                      <div>
                        <strong>Extracted Amount:</strong> ${verificationResult.verification.extracted_amount}
                      </div>
                    )}
                    {verificationResult.verification.warnings.length > 0 && (
                      <div className="mt-2">
                        <strong>Warnings:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {verificationResult.verification.warnings.map((warning: string, idx: number) => (
                            <li key={idx} className="text-xs">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {verificationResult.verification.recommendations && (
                      <div className="mt-2 text-xs bg-yellow-50 p-2 rounded">
                        <strong>Recommendations:</strong> {verificationResult.verification.recommendations}
                      </div>
                    )}
                  </div>
                  {verificationResult.verification.verified && (
                    <div className="mt-3 text-sm font-semibold text-green-700">
                      ✅ Bill verified! Awaiting authority approval to release Stage {stageNumber + 1} funds
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={uploading || !file}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading & Verifying with AI...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Verify Bill
              </>
            )}
          </Button>

          {uploading && (
            <div className="text-center text-sm text-gray-600 space-y-1">
              <div>🤖 AI is analyzing your document...</div>
              <div>⏱️ This may take 10-30 seconds</div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
