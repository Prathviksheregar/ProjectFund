from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentAnalysisView, 
    SBTTokenView, 
    DashboardView, 
    ProposalView,
    BillUploadView,
    BillApprovalView,
    AdminPanelView,
    BlockchainSyncView,
    StageReportAnalysisView
)
from .viewsets import (
    ProposalViewSet, UserProfileViewSet, TransactionViewSet,
    contract_stats, confirm_funding
)

router = DefaultRouter()
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # Specific endpoints MUST come before router to avoid conflicts
    path('analyze/', DocumentAnalysisView.as_view(), name='analyze-document'),
    path('stage-report/analyze/', StageReportAnalysisView.as_view(), name='stage-report-analyze'),
    path('sbt/', SBTTokenView.as_view(), name='sbt-tokens'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    # Bill verification endpoints
    path('bills/upload/', BillUploadView.as_view(), name='bill-upload'),
    path('bills/', BillUploadView.as_view(), name='bill-list'),
    path('bills/approve/', BillApprovalView.as_view(), name='bill-approve'),
    # Admin panel endpoints
    path('admin/panel/', AdminPanelView.as_view(), name='admin-panel'),
    # Blockchain sync endpoint
    path('sync/', BlockchainSyncView.as_view(), name='blockchain-sync'),
    # New API endpoints
    path('stats/', contract_stats, name='contract-stats'),
    path('fundings/<int:funding_id>/confirm/', confirm_funding, name='confirm-funding'),
    
    # Router URLs - MUST be last to avoid conflicts
    path('', include(router.urls)),
]