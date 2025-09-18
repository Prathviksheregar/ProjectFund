from django.urls import path
from .views import DocumentAnalysisView, SBTTokenView, DashboardView, ProposalView

urlpatterns = [
    path('analyze/', DocumentAnalysisView.as_view(), name='analyze-document'),
    path('sbt/', SBTTokenView.as_view(), name='sbt-tokens'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('proposals/', ProposalView.as_view(), name='proposals'),
]