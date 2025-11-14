from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import Proposal, Vote, Funding, UserProfile, Transaction, ProposalStage, Bill

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'wallet_address', 'is_verified', 'is_admin', 'reputation_score')


class VoteSerializer(serializers.ModelSerializer):
    voter_username = serializers.CharField(source='voter.username', read_only=True)

    class Meta:
        model = Vote
        fields = ('id', 'proposal', 'voter', 'voter_username', 'support', 'weight', 'created_at', 'tx_hash')


class FundingSerializer(serializers.ModelSerializer):
    funder_username = serializers.CharField(source='funder.username', read_only=True)

    class Meta:
        model = Funding
        fields = ('id', 'proposal', 'funder', 'funder_username', 'amount', 'tx_hash', 'status', 'created_at')


class ProposalStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalStage
        fields = ('id', 'stage_number', 'amount', 'state', 'report', 'ai_report', 'vote_count', 'created_at', 'completed_at')


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ('id', 'bill_type', 'amount', 'description', 'status', 'ai_verified', 'ai_confidence', 'ai_analysis', 'uploaded_at')


class ProposalDetailSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    votes = VoteSerializer(many=True, read_only=True, source='user_votes')
    fundings = FundingSerializer(many=True, read_only=True, source='user_fundings')
    stages = ProposalStageSerializer(many=True, read_only=True)
    bills = BillSerializer(many=True, read_only=True)
    votes_count = serializers.SerializerMethodField()
    support_percentage = serializers.SerializerMethodField()
    total_funded = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = (
            'id', 'proposal_id', 'description', 'recipient_address', 'total_amount',
            'state', 'current_stage', 'total_stages', 'created_at', 'updated_at',
            'creator_username', 'votes', 'fundings', 'stages', 'bills',
            'votes_count', 'support_percentage', 'total_funded', 'progress_percentage',
            'authority_yes_votes', 'authority_no_votes', 'public_yes_votes', 'public_no_votes'
        )

    def get_creator_username(self, obj):
        # Try to get from related user if available, otherwise use recipient address
        return obj.recipient_address

    def get_votes_count(self, obj):
        return obj.user_votes.count()

    def get_support_percentage(self, obj):
        total_votes = obj.user_votes.count()
        if total_votes == 0:
            return 0
        support_votes = obj.user_votes.filter(support=True).count()
        return (support_votes / total_votes) * 100

    def get_total_funded(self, obj):
        return obj.user_fundings.filter(status='confirmed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    def get_progress_percentage(self, obj):
        if obj.total_amount == 0:
            return 0
        total_funded = self.get_total_funded(obj)
        return min((float(total_funded) / float(obj.total_amount)) * 100, 100)


class ProposalListSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    funders_count = serializers.SerializerMethodField()
    total_funded = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    state_display = serializers.CharField(source='get_state_display', read_only=True)

    class Meta:
        model = Proposal
        fields = (
            'id', 'proposal_id', 'description', 'recipient_address', 'total_amount',
            'state', 'state_display', 'current_stage', 'total_stages', 'created_at',
            'creator_username', 'votes_count', 'funders_count', 'total_funded', 'progress_percentage'
        )

    def get_creator_username(self, obj):
        return obj.recipient_address

    def get_votes_count(self, obj):
        return obj.user_votes.count()

    def get_funders_count(self, obj):
        return obj.user_fundings.filter(status='confirmed').distinct('funder').count()

    def get_total_funded(self, obj):
        return obj.user_fundings.filter(status='confirmed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    def get_progress_percentage(self, obj):
        if obj.total_amount == 0:
            return 0
        total_funded = self.get_total_funded(obj)
        return min((float(total_funded) / float(obj.total_amount)) * 100, 100)


class ProposalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = ('description', 'recipient_address', 'total_amount', 'total_stages')


class TransactionSerializer(serializers.ModelSerializer):
    proposal_title = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ('id', 'tx_hash', 'tx_type', 'amount', 'status', 'proposal', 'proposal_title', 'created_at', 'confirmed_at')

    def get_proposal_title(self, obj):
        if obj.proposal:
            return obj.proposal.description[:50]
        return None
