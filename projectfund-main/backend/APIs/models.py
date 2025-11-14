from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class UserProfile(models.Model):
    """Extended user profile for blockchain integration"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    wallet_address = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    reputation_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.wallet_address}"

    class Meta:
        ordering = ['-reputation_score']


class Vote(models.Model):
    """User votes on proposals"""
    proposal = models.ForeignKey('Proposal', on_delete=models.CASCADE, related_name='user_votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposal_votes')
    support = models.BooleanField()  # True = support, False = against
    weight = models.DecimalField(max_digits=20, decimal_places=8, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    tx_hash = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ('proposal', 'voter')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.voter.username} - Proposal #{self.proposal.proposal_id}"


class Funding(models.Model):
    """User funding for proposals"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]

    proposal = models.ForeignKey('Proposal', on_delete=models.CASCADE, related_name='user_fundings')
    funder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposal_fundings')
    amount = models.DecimalField(max_digits=20, decimal_places=8, validators=[MinValueValidator(0)])
    tx_hash = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.funder.username} funded Proposal #{self.proposal.proposal_id}"


class Transaction(models.Model):
    """Track all blockchain transactions"""
    TX_TYPE_CHOICES = [
        ('create_proposal', 'Create Proposal'),
        ('vote', 'Vote'),
        ('fund', 'Fund'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blockchain_transactions')
    tx_hash = models.CharField(max_length=255, unique=True)
    tx_type = models.CharField(max_length=50, choices=TX_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    proposal = models.ForeignKey('Proposal', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tx_type} - {self.tx_hash}"


class Proposal(models.Model):
    """Proposal model synced with smart contract"""
    
    PROPOSAL_STATES = [
        (0, 'Created'),
        (1, 'UnderAuthorityVoting'),
        (2, 'PublicVoting'),
        (3, 'Approved'),
        (4, 'Rejected'),
        (5, 'InProgress'),
        (6, 'Completed'),
    ]
    
    proposal_id = models.IntegerField(unique=True)
    description = models.TextField()
    recipient_address = models.CharField(max_length=42)
    total_amount = models.DecimalField(max_digits=18, decimal_places=8)
    state = models.IntegerField(choices=PROPOSAL_STATES, default=0)
    authority_yes_votes = models.IntegerField(default=0)
    authority_no_votes = models.IntegerField(default=0)
    public_yes_votes = models.IntegerField(default=0)
    public_no_votes = models.IntegerField(default=0)
    current_stage = models.IntegerField(default=0)
    total_stages = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Proposal #{self.proposal_id}: {self.description[:50]}"
    
    class Meta:
        ordering = ['-created_at']


class ProposalStage(models.Model):
    """Stage information for multi-stage proposals"""
    
    STAGE_STATES = [
        (0, 'NotStarted'),
        (1, 'InProgress'),
        (2, 'Completed'),
    ]
    
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='stages')
    stage_number = models.IntegerField()
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    state = models.IntegerField(choices=STAGE_STATES, default=0)
    report = models.TextField(blank=True)
    ai_report = models.TextField(blank=True)
    vote_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Proposal #{self.proposal.proposal_id} - Stage {self.stage_number}"
    
    class Meta:
        ordering = ['stage_number']
        unique_together = ['proposal', 'stage_number']


class Bill(models.Model):
    """Bills/receipts uploaded for verification"""
    
    BILL_TYPES = [
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('quotation', 'Quotation'),
        ('other', 'Other'),
    ]
    
    VERIFICATION_STATUS = [
        ('pending', 'Pending AI Verification'),
        ('verifying', 'AI Verification in Progress'),
        ('verified', 'AI Verified'),
        ('failed', 'AI Verification Failed'),
        ('approved', 'Authority Approved'),
        ('rejected', 'Authority Rejected'),
    ]
    
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='bills')
    stage = models.ForeignKey(ProposalStage, on_delete=models.CASCADE, related_name='bills')
    
    # Bill details
    bill_type = models.CharField(max_length=20, choices=BILL_TYPES)
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    description = models.TextField()
    
    # File storage
    file = models.FileField(upload_to='bills/%Y/%m/')
    file_hash = models.CharField(max_length=66, blank=True)  # IPFS hash or file hash
    
    # AI Verification results
    ai_verified = models.BooleanField(default=False)
    ai_confidence = models.IntegerField(default=0)  # 0-100
    ai_analysis = models.TextField(blank=True)
    ai_extracted_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True)
    ai_warnings = models.JSONField(default=list)
    ai_recommendations = models.TextField(blank=True)
    
    # Authority approval
    authority_approved = models.BooleanField(default=False)
    approved_by = models.CharField(max_length=42, blank=True)  # Authority address
    approval_notes = models.TextField(blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Bill for Proposal #{self.proposal.proposal_id} - Stage {self.stage.stage_number}"
    
    class Meta:
        ordering = ['-uploaded_at']


class AIVerificationLog(models.Model):
    """Log of AI verification attempts"""
    
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='verification_logs')
    
    # Verification details
    verified = models.BooleanField()
    confidence = models.IntegerField()
    analysis = models.TextField()
    extracted_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True)
    warnings = models.JSONField(default=list)
    
    # Metadata
    processing_time = models.FloatField()  # seconds
    model_used = models.CharField(max_length=50, default='gpt-4o')
    api_cost = models.DecimalField(max_digits=10, decimal_places=6, null=True)  # USD
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Verification Log - Bill #{self.bill.id} - {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']


class SBTApplication(models.Model):
    """Track SBT token applications"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Admin Approval'),
        ('approved', 'Approved - SBT Minted'),
        ('rejected', 'Rejected'),
    ]
    
    # Applicant details
    applicant_address = models.CharField(max_length=42, unique=True)
    voter_hash = models.CharField(max_length=66)  # bytes32 as hex string
    
    # Transaction details
    application_tx_hash = models.CharField(max_length=66, blank=True)
    approval_tx_hash = models.CharField(max_length=66, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    nullifier = models.BigIntegerField(null=True, blank=True)
    token_id = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.CharField(max_length=42, blank=True)  # Admin address
    
    # Blockchain sync
    synced_from_blockchain = models.BooleanField(default=False)
    
    def __str__(self):
        return f"SBT Application - {self.applicant_address} - {self.status}"
    
    class Meta:
        ordering = ['-applied_at']
