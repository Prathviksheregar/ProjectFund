from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
# from .utils import process_document  # Commented out to avoid langchain import issues
from django.core.files.uploadedfile import UploadedFile
from django.utils import timezone
from .models import Proposal, ProposalStage, Bill, AIVerificationLog
from .ai_verification import ai_verifier
import json
import time
import hashlib

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
            # result = process_document(file, custom_questions)  # Disabled due to langchain issues
            result = {"message": "Document processing temporarily disabled"}
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Processing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StageReportAnalysisView(APIView):
    """
    API endpoint for analyzing stage reports using AI verification.
    Replaces Pinata IPFS integration with AI-powered document analysis.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        """
        Analyze a stage report using AI verification.
        
        Expected parameters:
        - file: PDF file to analyze
        - proposal_id: ID of the proposal (optional, for storing analysis)
        - stage_number: Stage number (optional)
        - expected_amount: Expected amount for verification (optional)
        """
        try:
            # Check if file is provided
            if 'file' not in request.FILES:
                return Response(
                    {"error": "No file provided. Please upload a PDF file."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file = request.FILES['file']
            
            # Validate file type
            if not file.name.lower().endswith('.pdf'):
                return Response(
                    {"error": "Only PDF files are accepted"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            proposal_id = request.data.get('proposal_id')
            stage_number = request.data.get('stage_number')
            expected_amount = request.data.get('expected_amount')
            
            # Save file temporarily
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                for chunk in file.chunks():
                    tmp_file.write(chunk)
                temp_path = tmp_file.name
            
            try:
                # Perform AI analysis
                analysis_result = ai_verifier.verify_bill(
                    temp_path,
                    expected_amount=float(expected_amount) if expected_amount else 0,
                    bill_type='report',
                    stage_number=int(stage_number) if stage_number else 0
                )
                
                # Calculate file hash for blockchain reference
                file_hash = hashlib.sha256()
                with open(temp_path, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b''):
                        file_hash.update(chunk)
                file_hash_hex = file_hash.hexdigest()
                
                # Store analysis in database if proposal_id is provided
                if proposal_id and stage_number:
                    try:
                        proposal = Proposal.objects.get(proposal_id=proposal_id)
                        stage = ProposalStage.objects.get(proposal=proposal, stage_number=stage_number)
                        
                        # Update stage with AI analysis
                        stage.ai_report = json.dumps(analysis_result)
                        stage.report = file_hash_hex  # Store hash as reference
                        stage.save()
                        
                    except (Proposal.DoesNotExist, ProposalStage.DoesNotExist) as e:
                        print(f"Warning: Could not store analysis for proposal {proposal_id}: {str(e)}")
                
                return Response({
                    'success': True,
                    'verified': analysis_result.get('verified', False),
                    'confidence': analysis_result.get('confidence', 0),
                    'analysis': analysis_result,
                    'file_hash': file_hash_hex,  # Can be used in blockchain submission
                    'message': 'Stage report analyzed successfully using AI'
                }, status=status.HTTP_200_OK)
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        
        except Exception as e:
            print(f"Error analyzing stage report: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Analysis failed: {str(e)}"},
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
        """Register SBT token application"""
        try:
            from .models import SBTApplication
            
            action = request.data.get('action', 'register')
            
            if action == 'register':
                # Register a new SBT application
                wallet_address = request.data.get('wallet_address') or request.data.get('applicant_address')
                voter_hash = request.data.get('voter_hash')
                tx_hash = request.data.get('tx_hash', '')
                
                if not wallet_address or not voter_hash:
                    return Response(
                        {"error": "wallet_address and voter_hash are required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if application already exists
                existing = SBTApplication.objects.filter(applicant_address=wallet_address).first()
                if existing:
                    if existing.status == 'approved':
                        return Response(
                            {"error": "SBT already minted for this address"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif existing.status == 'pending':
                        return Response(
                            {"error": "Application already pending approval"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Create new application
                application = SBTApplication.objects.create(
                    applicant_address=wallet_address,
                    voter_hash=voter_hash,
                    application_tx_hash=tx_hash,
                    status='pending'
                )
                
                return Response({
                    "success": True,
                    "message": "SBT application submitted successfully",
                    "application_id": application.id,
                    "status": "pending"
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response(
                    {"error": "Invalid action"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {"error": f"Failed to process SBT request: {str(e)}"},
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


class BillUploadView(APIView):
    """
    API endpoint for uploading bills after Stage 1 completion
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        """Upload bill for AI verification"""
        try:
            # Extract data from request
            proposal_id = request.data.get('proposal_id')
            stage_number = request.data.get('stage_number', 1)
            bill_type = request.data.get('bill_type', 'receipt')
            amount = request.data.get('amount')
            description = request.data.get('description', '')
            file = request.FILES.get('file')
            
            # Validation
            if not all([proposal_id, amount, file]):
                return Response(
                    {"error": "proposal_id, amount, and file are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create proposal
            proposal, created = Proposal.objects.get_or_create(
                proposal_id=proposal_id,
                defaults={
                    'description': description,
                    'recipient_address': request.data.get('recipient_address', '0x0'),
                    'total_amount': amount,
                    'state': 5,  # InProgress
                    'current_stage': int(stage_number),
                    'total_stages': int(request.data.get('total_stages', 3))
                }
            )
            
            # Get or create stage
            stage, _ = ProposalStage.objects.get_or_create(
                proposal=proposal,
                stage_number=stage_number,
                defaults={
                    'amount': amount,
                    'state': 1  # InProgress
                }
            )
            
            # Calculate file hash
            file.seek(0)
            file_hash = hashlib.sha256(file.read()).hexdigest()
            file.seek(0)
            
            # Create bill record
            bill = Bill.objects.create(
                proposal=proposal,
                stage=stage,
                bill_type=bill_type,
                amount=amount,
                description=description,
                file=file,
                file_hash=file_hash,
                status='verifying'
            )
            
            # Trigger AI verification
            start_time = time.time()
            
            verification_result = ai_verifier.verify_bill(
                image_path=bill.file.path,
                expected_amount=float(amount),
                bill_type=bill_type,
                stage_number=stage_number
            )
            
            processing_time = time.time() - start_time
            
            # Update bill with verification results
            bill.ai_verified = verification_result['verified']
            bill.ai_confidence = verification_result['confidence']
            bill.ai_analysis = verification_result['analysis']
            bill.ai_extracted_amount = verification_result.get('extracted_amount', 0)
            bill.ai_warnings = verification_result.get('warnings', [])
            bill.ai_recommendations = verification_result.get('recommendations', '')
            bill.status = 'verified' if verification_result['verified'] else 'failed'
            bill.verified_at = timezone.now()
            bill.save()
            
            # Log verification attempt
            AIVerificationLog.objects.create(
                bill=bill,
                verified=verification_result['verified'],
                confidence=verification_result['confidence'],
                analysis=verification_result['analysis'],
                extracted_amount=verification_result.get('extracted_amount'),
                warnings=verification_result.get('warnings', []),
                processing_time=processing_time,
                model_used='gpt-4o'
            )
            
            # Prepare response
            response_data = {
                "success": True,
                "bill_id": bill.id,
                "verification": {
                    "verified": verification_result['verified'],
                    "confidence": verification_result['confidence'],
                    "extracted_amount": verification_result.get('extracted_amount'),
                    "warnings": verification_result.get('warnings', []),
                    "recommendations": verification_result.get('recommendations', '')
                },
                "status": bill.status,
                "message": "Bill verified successfully" if verification_result['verified'] else "Bill verification failed - manual review required",
                "next_action": "awaiting_authority_approval" if verification_result['verified'] else "manual_verification_required"
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"Bill upload error: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Failed to process bill: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request, *args, **kwargs):
        """Get bills for a proposal"""
        try:
            proposal_id = request.query_params.get('proposal_id')
            
            if not proposal_id:
                return Response(
                    {"error": "proposal_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            bills = Bill.objects.filter(proposal__proposal_id=proposal_id)
            
            bills_data = []
            for bill in bills:
                bills_data.append({
                    "id": bill.id,
                    "stage_number": bill.stage.stage_number,
                    "bill_type": bill.bill_type,
                    "amount": str(bill.amount),
                    "description": bill.description,
                    "file_url": bill.file.url if bill.file else None,
                    "ai_verified": bill.ai_verified,
                    "ai_confidence": bill.ai_confidence,
                    "ai_extracted_amount": str(bill.ai_extracted_amount) if bill.ai_extracted_amount else None,
                    "ai_warnings": bill.ai_warnings,
                    "authority_approved": bill.authority_approved,
                    "status": bill.status,
                    "uploaded_at": bill.uploaded_at.isoformat(),
                    "verified_at": bill.verified_at.isoformat() if bill.verified_at else None
                })
            
            return Response(bills_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch bills: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BillApprovalView(APIView):
    """
    API endpoint for authorities to approve AI-verified bills
    """
    
    def post(self, request, *args, **kwargs):
        """Approve or reject a bill"""
        try:
            bill_id = request.data.get('bill_id')
            approved = request.data.get('approved', False)
            authority_address = request.data.get('authority_address')
            notes = request.data.get('notes', '')
            
            if not all([bill_id, authority_address]):
                return Response(
                    {"error": "bill_id and authority_address are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get bill
            bill = Bill.objects.get(id=bill_id)
            
            # Check if AI verified
            if not bill.ai_verified:
                return Response(
                    {"error": "Bill must be AI verified before authority approval"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update bill
            bill.authority_approved = approved
            bill.approved_by = authority_address
            bill.approval_notes = notes
            bill.status = 'approved' if approved else 'rejected'
            bill.approved_at = timezone.now()
            bill.save()
            
            # If approved, mark stage as ready for next release
            if approved:
                stage = bill.stage
                stage.state = 2  # Completed
                stage.completed_at = timezone.now()
                stage.save()
            
            return Response({
                "success": True,
                "bill_id": bill.id,
                "approved": approved,
                "message": "Bill approved - ready for next stage fund release" if approved else "Bill rejected",
                "next_action": "release_next_stage_funds" if approved else "resubmit_bill"
            }, status=status.HTTP_200_OK)
            
        except Bill.DoesNotExist:
            return Response(
                {"error": "Bill not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to process approval: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminPanelView(APIView):
    """
    Admin panel API for managing proposals, voting, and bills
    """
    
    def get(self, request, *args, **kwargs):
        """Get admin dashboard data"""
        try:
            action = request.query_params.get('action', 'overview')
            
            # Sync proposals from blockchain before returning data
            # Temporarily disabled to isolate errors
            # from .contract_sync import sync_all_proposals
            # sync_result = sync_all_proposals()
            # if not sync_result.get('success'):
            #     print(f"⚠️ Warning: Could not sync from blockchain: {sync_result.get('message')}")
            # else:
            #     print(f"✅ Synced {sync_result.get('synced', 0)} proposals from blockchain")
            
            if action == 'overview':
                return self._get_overview()
            elif action == 'proposals':
                return self._get_proposals(request)
            elif action == 'bills':
                return self._get_pending_bills()
            elif action == 'running':
                return self._get_running_proposals()
            elif action == 'sbt_applications':
                return self._get_sbt_applications()
            else:
                return Response(
                    {"error": "Invalid action"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"❌ AdminPanelView Error: {str(e)}")
            print(error_trace)
            return Response(
                {"error": f"Failed to fetch admin data: {str(e)}", "traceback": error_trace},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_overview(self):
        """Get admin overview stats"""
        total_proposals = Proposal.objects.count()
        pending_voting = Proposal.objects.filter(state__in=[1, 2]).count()  # Authority/Public voting
        approved = Proposal.objects.filter(state=3).count()
        running = Proposal.objects.filter(state=5).count()  # InProgress
        completed = Proposal.objects.filter(state=6).count()
        
        pending_bills = Bill.objects.filter(status='verified', authority_approved=False).count()
        total_bills = Bill.objects.count()
        
        # Get SBT statistics from database
        from .models import SBTApplication
        pending_sbt = SBTApplication.objects.filter(status='pending').count()
        
        return Response({
            "stats": {
                "total_proposals": total_proposals,
                "pending_voting": pending_voting,
                "approved_proposals": approved,
                "running_proposals": running,
                "completed_proposals": completed,
                "pending_bills": pending_bills,
                "total_bills_verified": total_bills,
                "pending_sbt_applications": pending_sbt
            }
        }, status=status.HTTP_200_OK)
    
    def _get_proposals(self, request):
        """Get proposals by state"""
        state = request.query_params.get('state', 'all')
        
        if state == 'all':
            proposals = Proposal.objects.all()
        elif state == 'pending_voting':
            proposals = Proposal.objects.filter(state__in=[1, 2])
        elif state == 'approved':
            proposals = Proposal.objects.filter(state=3)
        elif state == 'running':
            proposals = Proposal.objects.filter(state=5)
        elif state == 'completed':
            proposals = Proposal.objects.filter(state=6)
        else:
            proposals = Proposal.objects.all()
        
        proposals_data = []
        for proposal in proposals:
            proposals_data.append({
                "id": proposal.id,
                "proposal_id": proposal.proposal_id,
                "description": proposal.description,
                "recipient": proposal.recipient_address,
                "total_amount": str(proposal.total_amount),
                "state": proposal.get_state_display(),
                "state_code": proposal.state,
                "current_stage": proposal.current_stage,
                "total_stages": proposal.total_stages,
                "authority_yes": proposal.authority_yes_votes,
                "authority_no": proposal.authority_no_votes,
                "public_yes": proposal.public_yes_votes,
                "public_no": proposal.public_no_votes,
                "created_at": proposal.created_at.isoformat(),
                "can_close_voting": proposal.state == 2,  # PublicVoting
                "can_start": proposal.state == 3  # Approved
            })
        
        return Response(proposals_data, status=status.HTTP_200_OK)
    
    def _get_pending_bills(self):
        """Get bills pending authority approval"""
        bills = Bill.objects.filter(
            status='verified',
            authority_approved=False
        ).select_related('proposal', 'stage')
        
        bills_data = []
        for bill in bills:
            bills_data.append({
                "id": bill.id,
                "proposal_id": bill.proposal.proposal_id,
                "proposal_description": bill.proposal.description,
                "stage_number": bill.stage.stage_number,
                "amount": str(bill.amount),
                "bill_type": bill.bill_type,
                "ai_verified": bill.ai_verified,
                "ai_confidence": bill.ai_confidence,
                "ai_extracted_amount": str(bill.ai_extracted_amount) if bill.ai_extracted_amount else None,
                "ai_warnings": bill.ai_warnings,
                "file_url": bill.file.url if bill.file else None,
                "uploaded_at": bill.uploaded_at.isoformat(),
                "verified_at": bill.verified_at.isoformat() if bill.verified_at else None
            })
        
        return Response(bills_data, status=status.HTTP_200_OK)
    
    def _get_running_proposals(self):
        """Get running proposals with stage details"""
        proposals = Proposal.objects.filter(state=5).prefetch_related('stages', 'bills')
        
        running_data = []
        for proposal in proposals:
            stages_data = []
            for stage in proposal.stages.all():
                stage_bills = stage.bills.filter(authority_approved=True).values(
                    'id', 'bill_type', 'amount', 'approved_at'
                )
                
                stages_data.append({
                    "stage_number": stage.stage_number,
                    "amount": str(stage.amount),
                    "state": stage.get_state_display(),
                    "state_code": stage.state,
                    "completed_at": stage.completed_at.isoformat() if stage.completed_at else None,
                    "bills": list(stage_bills)
                })
            
            running_data.append({
                "id": proposal.id,
                "proposal_id": proposal.proposal_id,
                "description": proposal.description,
                "recipient": proposal.recipient_address,
                "total_amount": str(proposal.total_amount),
                "current_stage": proposal.current_stage,
                "total_stages": proposal.total_stages,
                "stages": stages_data,
                "created_at": proposal.created_at.isoformat()
            })
        
        return Response(running_data, status=status.HTTP_200_OK)
    
    def _get_sbt_applications(self):
        """Get pending SBT applications from database"""
        from .models import SBTApplication
        
        # Get all pending applications
        pending_apps = SBTApplication.objects.filter(status='pending').order_by('-applied_at')
        
        applications = []
        for app in pending_apps:
            applications.append({
                "id": app.id,
                "index": app.id,  # For compatibility with old frontend
                "address": app.applicant_address,
                "voter_hash": app.voter_hash,
                "has_applied": True,
                "is_registered": False,
                "applied_at": app.applied_at.isoformat(),
                "application_tx_hash": app.application_tx_hash
            })
        
        return Response(applications, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        """Admin actions: close voting, start proposal, approve SBT, etc."""
        try:
            action = request.data.get('action')
            
            # Handle SBT approval/rejection separately (doesn't need proposal_id)
            if action == 'approve_sbt':
                return self._approve_sbt_application(request)
            elif action == 'reject_sbt':
                return self._reject_sbt_application(request)
            
            proposal_id = request.data.get('proposal_id')
            admin_address = request.data.get('admin_address')
            
            if not all([action, proposal_id, admin_address]):
                return Response(
                    {"error": "action, proposal_id, and admin_address are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            proposal = Proposal.objects.get(proposal_id=proposal_id)
            
            if action == 'close_voting':
                return self._close_voting(proposal)
            elif action == 'start_proposal':
                return self._start_proposal(proposal)
            elif action == 'complete_stage':
                stage_number = request.data.get('stage_number')
                return self._complete_stage(proposal, stage_number)
            else:
                return Response(
                    {"error": "Invalid action"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Proposal.DoesNotExist:
            return Response(
                {"error": "Proposal not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to process admin action: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _close_voting(self, proposal):
        """Close public voting and approve/reject proposal"""
        if proposal.state != 2:  # PublicVoting
            return Response(
                {"error": "Proposal is not in public voting state"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Count votes
        if proposal.public_yes_votes > proposal.public_no_votes:
            proposal.state = 3  # Approved
            message = "Proposal approved! Ready to start execution."
        else:
            proposal.state = 4  # Rejected
            message = "Proposal rejected based on voting results."
        
        proposal.save()
        
        return Response({
            "success": True,
            "proposal_id": proposal.proposal_id,
            "new_state": proposal.get_state_display(),
            "message": message,
            "votes": {
                "yes": proposal.public_yes_votes,
                "no": proposal.public_no_votes
            }
        }, status=status.HTTP_200_OK)
    
    def _start_proposal(self, proposal):
        """Start proposal execution (move to InProgress)"""
        if proposal.state != 3:  # Approved
            return Response(
                {"error": "Only approved proposals can be started"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        proposal.state = 5  # InProgress
        proposal.current_stage = 0
        proposal.save()
        
        return Response({
            "success": True,
            "proposal_id": proposal.proposal_id,
            "message": "Proposal started! Now in running proposals section.",
            "new_state": "InProgress"
        }, status=status.HTTP_200_OK)
    
    def _complete_stage(self, proposal, stage_number):
        """Mark a stage as completed after bill verification"""
        if proposal.state != 5:  # InProgress
            return Response(
                {"error": "Proposal must be in progress"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stage = ProposalStage.objects.get(
            proposal=proposal,
            stage_number=stage_number
        )
        
        # Check if bill is approved for this stage
        approved_bill = Bill.objects.filter(
            stage=stage,
            authority_approved=True
        ).first()
        
        if not approved_bill:
            return Response(
                {"error": "No approved bill found for this stage"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stage.state = 2  # Completed
        stage.completed_at = timezone.now()
        stage.save()
        
        # Move to next stage
        proposal.current_stage = stage_number + 1
        
        # Check if all stages completed
        if proposal.current_stage >= proposal.total_stages:
            proposal.state = 6  # Completed
            message = "Proposal completed! All stages finished."
        else:
            message = f"Stage {stage_number} completed. Moving to stage {proposal.current_stage}."
        
        proposal.save()
        
        return Response({
            "success": True,
            "proposal_id": proposal.proposal_id,
            "stage_completed": stage_number,
            "current_stage": proposal.current_stage,
            "message": message,
            "proposal_completed": proposal.state == 6
        }, status=status.HTTP_200_OK)
    
    def _approve_sbt_application(self, request):
        """Approve an SBT application"""
        applicant_address = request.data.get('applicant_address')
        nullifier = request.data.get('nullifier', 1)  # Default nullifier
        admin_address = request.data.get('admin_address', '')
        
        if not applicant_address:
            return Response(
                {"error": "applicant_address is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the application from database
            from .models import SBTApplication
            application = SBTApplication.objects.get(applicant_address=applicant_address)
            
            # Update application status
            application.status = 'approved'
            application.approved_by = admin_address
            application.nullifier = str(nullifier)
            application.save()
            
            # Note: In production, this would also call the smart contract
            # to mint the SBT token on the blockchain
            return Response({
                "success": True,
                "message": f"SBT application approved for {applicant_address}",
                "applicant": applicant_address,
                "status": "approved",
                "note": "Application approved in database. Please mint SBT token on blockchain using: npx hardhat run scripts/approve-sbt.js --network sepolia"
            }, status=status.HTTP_200_OK)
            
        except SBTApplication.DoesNotExist:
            return Response(
                {"error": f"No application found for address {applicant_address}"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to approve application: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _reject_sbt_application(self, request):
        """Reject an SBT application"""
        applicant_address = request.data.get('applicant_address')
        admin_address = request.data.get('admin_address', '')
        reason = request.data.get('reason', 'Application rejected by admin')
        
        if not applicant_address:
            return Response(
                {"error": "applicant_address is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the application from database
            from .models import SBTApplication
            application = SBTApplication.objects.get(applicant_address=applicant_address)
            
            # Update application status
            application.status = 'rejected'
            application.approved_by = admin_address
            application.save()
            
            return Response({
                "success": True,
                "message": f"SBT application rejected for {applicant_address}",
                "applicant": applicant_address,
                "status": "rejected",
                "reason": reason
            }, status=status.HTTP_200_OK)
            
        except SBTApplication.DoesNotExist:
            return Response(
                {"error": f"No application found for address {applicant_address}"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to reject application: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BlockchainSyncView(APIView):
    """
    Sync proposals from blockchain to database
    """
    
    def post(self, request, *args, **kwargs):
        """Sync all proposals or a specific proposal"""
        try:
            from .contract_sync import sync_all_proposals, sync_proposal_from_blockchain
            
            proposal_id = request.data.get('proposal_id')
            
            if proposal_id:
                # Sync specific proposal
                success, message = sync_proposal_from_blockchain(proposal_id)
                return Response({
                    "success": success,
                    "message": message,
                    "proposal_id": proposal_id
                }, status=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST)
            else:
                # Sync all proposals
                result = sync_all_proposals()
                return Response(result, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"error": f"Sync failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request, *args, **kwargs):
        """Get sync status"""
        try:
            from .contract_sync import get_web3_instance
            
            web3 = get_web3_instance()
            is_connected = web3 is not None and web3.is_connected()
            
            return Response({
                "blockchain_connected": is_connected,
                "contract_address": "0x9B00068CfBF060E4aad61a892a86E98C108D760e",
                "network": "sepolia",
                "proposals_in_db": Proposal.objects.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Status check failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )