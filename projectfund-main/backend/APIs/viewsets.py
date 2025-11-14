from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Sum, Count
from django.contrib.auth.models import User
from datetime import timedelta

from .models import Proposal, Vote, Funding, UserProfile, Transaction
from .serializers import (
    ProposalListSerializer, ProposalDetailSerializer, ProposalCreateSerializer,
    VoteSerializer, FundingSerializer, UserProfileSerializer, TransactionSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProposalViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Proposal.objects.all()
        state_filter = self.request.query_params.get('state', None)
        search = self.request.query_params.get('search', None)

        if state_filter:
            queryset = queryset.filter(state=state_filter)
        if search:
            queryset = queryset.filter(Q(description__icontains=search) | Q(recipient_address__icontains=search))

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProposalDetailSerializer
        elif self.action == 'create':
            return ProposalCreateSerializer
        return ProposalListSerializer

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        proposal = serializer.save()
        output_serializer = ProposalDetailSerializer(proposal)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        proposal = self.get_object()
        support = request.data.get('support')

        if support is None:
            return Response({'detail': 'support parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert string to boolean if needed
        if isinstance(support, str):
            support = support.lower() == 'true'

        vote, created = Vote.objects.update_or_create(
            proposal=proposal,
            voter=request.user,
            defaults={'support': support, 'tx_hash': request.data.get('tx_hash', '')}
        )

        # Update proposal vote counts
        if support:
            proposal.public_yes_votes = proposal.user_votes.filter(support=True).count()
        else:
            proposal.public_no_votes = proposal.user_votes.filter(support=False).count()
        proposal.save()

        serializer = VoteSerializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def fund(self, request, pk=None):
        proposal = self.get_object()
        amount = request.data.get('amount')
        tx_hash = request.data.get('tx_hash')

        if not amount or not tx_hash:
            return Response({'detail': 'amount and tx_hash required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        funding = Funding.objects.create(
            proposal=proposal,
            funder=request.user,
            amount=amount,
            tx_hash=tx_hash,
            status='pending'
        )

        serializer = FundingSerializer(funding)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def votes(self, request, pk=None):
        proposal = self.get_object()
        votes = proposal.user_votes.all()
        serializer = VoteSerializer(votes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def fundings(self, request, pk=None):
        proposal = self.get_object()
        fundings = proposal.user_fundings.all()
        serializer = FundingSerializer(fundings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending proposals"""
        seven_days_ago = timezone.now() - timedelta(days=7)
        proposals = Proposal.objects.filter(
            created_at__gte=seven_days_ago
        ).annotate(
            votes_count=Count('user_votes')
        ).order_by('-votes_count')[:5]

        serializer = self.get_serializer(proposals, many=True)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return UserProfile.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def verify_wallet(self, request):
        """Verify wallet address with signature"""
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')

        if not wallet_address:
            return Response({'detail': 'wallet_address required'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.wallet_address = wallet_address
        profile.is_verified = True
        profile.save()

        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_transaction(self, request):
        """Create a new transaction record"""
        tx_data = {
            'user': request.user.id,
            'tx_hash': request.data.get('tx_hash'),
            'tx_type': request.data.get('tx_type'),
            'amount': request.data.get('amount'),
            'proposal': request.data.get('proposal_id'),
            'status': 'pending'
        }

        serializer = self.get_serializer(data=tx_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def confirm(self, request):
        """Confirm a transaction"""
        tx_hash = request.data.get('tx_hash')

        try:
            transaction = Transaction.objects.get(tx_hash=tx_hash, user=request.user)
            transaction.status = 'confirmed'
            transaction.confirmed_at = timezone.now()
            transaction.save()

            # If it's a funding transaction, confirm the funding
            if transaction.tx_type == 'fund' and transaction.proposal:
                funding = Funding.objects.filter(tx_hash=tx_hash).first()
                if funding:
                    funding.status = 'confirmed'
                    funding.confirmed_at = timezone.now()
                    funding.save()

            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Transaction.DoesNotExist:
            return Response({'detail': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def contract_stats(request):
    """Get contract statistics"""
    stats = {
        'total_proposals': Proposal.objects.count(),
        'active_proposals': Proposal.objects.exclude(state__in=[4, 6]).count(),
        'total_funding': Funding.objects.filter(status='confirmed').aggregate(Sum('amount'))['amount__sum'] or 0,
        'total_votes': Vote.objects.count(),
        'recent_proposals': ProposalListSerializer(
            Proposal.objects.all().order_by('-created_at')[:5],
            many=True
        ).data
    }
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_funding(request, funding_id):
    """Confirm funding transaction"""
    try:
        funding = Funding.objects.get(id=funding_id)
        funding.status = 'confirmed'
        funding.confirmed_at = timezone.now()
        funding.save()

        serializer = FundingSerializer(funding)
        return Response(serializer.data)
    except Funding.DoesNotExist:
        return Response({'detail': 'Funding not found'}, status=status.HTTP_404_NOT_FOUND)
