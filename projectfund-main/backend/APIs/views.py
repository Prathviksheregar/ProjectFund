from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import process_document
from django.core.files.uploadedfile import UploadedFile
import json

class DocumentAnalysisView(APIView):
    """
    API endpoint for analyzing government funding documents.
    """
    
    def post(self, request, *args, **kwargs):
        # Check if file is in request
        if 'file' not in request.FILES:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get file from request
        file = request.FILES['file']
        
        # Get custom questions if provided
        custom_questions = None
        if 'custom_questions' in request.data:
            try:
                custom_questions = json.loads(request.data['custom_questions'])
            except json.JSONDecodeError:
                return Response(
                    {"error": "Invalid format for custom_questions"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Process document
            result = process_document(file, custom_questions)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Processing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SBTTokenView(APIView):
    """
    API endpoint for SBT token operations.
    """
    
    def get(self, request, *args, **kwargs):
        """Get SBT token information"""
        try:
            # Mock data - replace with actual contract interaction
            sbt_data = {
                "contract_address": "0x3F185534338d3cfC7E6D4597B74BE99e1FF9eC41",
                "network": "sepolia",
                "tokens": [
                    {
                        "token_id": 1,
                        "owner": "0x...",
                        "metadata": {
                            "name": "Verified Citizen",
                            "description": "SBT for verified citizens",
                            "attributes": []
                        }
                    }
                ]
            }
            return Response(sbt_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch SBT data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, *args, **kwargs):
        """Mint new SBT token"""
        try:
            wallet_address = request.data.get('wallet_address')
            if not wallet_address:
                return Response(
                    {"error": "Wallet address required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock response - replace with actual contract interaction
            result = {
                "success": True,
                "transaction_hash": "0x...",
                "token_id": 1,
                "wallet_address": wallet_address
            }
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Failed to mint SBT: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardView(APIView):
    """
    API endpoint for dashboard data.
    """
    
    def get(self, request, *args, **kwargs):
        """Get dashboard statistics and data"""
        try:
            # Mock data - replace with actual database queries
            dashboard_data = {
                "stats": {
                    "total_proposals": 12,
                    "active_proposals": 5,
                    "total_funding": "1,500,000",
                    "approved_funding": "800,000",
                    "pending_funding": "700,000"
                },
                "recent_proposals": [
                    {
                        "id": 1,
                        "title": "Smart City Infrastructure",
                        "amount": "500,000",
                        "status": "active",
                        "votes": 125,
                        "created_at": "2025-09-01"
                    },
                    {
                        "id": 2,
                        "title": "Education Technology Initiative",
                        "amount": "300,000",
                        "status": "pending",
                        "votes": 89,
                        "created_at": "2025-08-28"
                    }
                ],
                "voting_activity": [
                    {"date": "2025-09-01", "votes": 45},
                    {"date": "2025-09-02", "votes": 38},
                    {"date": "2025-09-03", "votes": 52}
                ]
            }
            return Response(dashboard_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch dashboard data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProposalView(APIView):
    """
    API endpoint for proposal operations.
    """
    
    def get(self, request, *args, **kwargs):
        """Get all proposals"""
        try:
            # Mock data - replace with actual database queries
            proposals = [
                {
                    "id": 1,
                    "title": "Smart City Infrastructure Development",
                    "description": "Modernizing city infrastructure with IoT sensors and smart traffic management",
                    "amount": "500000",
                    "category": "Infrastructure",
                    "status": "active",
                    "votes_for": 125,
                    "votes_against": 25,
                    "creator": "0x1234...",
                    "created_at": "2025-09-01T10:00:00Z",
                    "deadline": "2025-10-01T10:00:00Z"
                },
                {
                    "id": 2,
                    "title": "Education Technology Initiative",
                    "description": "Providing tablets and internet access to rural schools",
                    "amount": "300000",
                    "category": "Education",
                    "status": "pending",
                    "votes_for": 89,
                    "votes_against": 12,
                    "creator": "0x5678...",
                    "created_at": "2025-08-28T14:30:00Z",
                    "deadline": "2025-09-28T14:30:00Z"
                }
            ]
            return Response(proposals, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch proposals: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, *args, **kwargs):
        """Create new proposal"""
        try:
            title = request.data.get('title')
            description = request.data.get('description')
            amount = request.data.get('amount')
            
            if not all([title, description, amount]):
                return Response(
                    {"error": "Title, description, and amount are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock response - replace with actual database/contract operations
            result = {
                "success": True,
                "proposal_id": 3,
                "title": title,
                "description": description,
                "amount": amount,
                "status": "pending"
            }
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Failed to create proposal: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )