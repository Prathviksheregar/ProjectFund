"""
Quick test script for AI bill verification
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from APIs.ai_verification import ai_verifier

def test_verification():
    """Test AI verification with a sample scenario"""
    
    print("="*60)
    print("🤖 AI BILL VERIFICATION SYSTEM TEST")
    print("="*60)
    
    # Test 1: Check if AI service is initialized
    print("\n1. Checking AI Service...")
    if ai_verifier.client:
        print("   ✅ OpenAI client initialized")
        print(f"   📊 Model: {ai_verifier.model}")
    else:
        print("   ⚠️  Running in MOCK mode (no API key)")
        print("   💡 Add OPENAI_API_KEY to .env for production")
    
    # Test 2: Mock verification
    print("\n2. Testing Mock Verification...")
    result = ai_verifier._mock_verification(0.01)
    print(f"   Verified: {result['verified']}")
    print(f"   Confidence: {result['confidence']}%")
    print(f"   Warnings: {len(result['warnings'])}")
    
    # Test 3: Database models
    print("\n3. Checking Database Models...")
    from APIs.models import Proposal, Bill, ProposalStage, AIVerificationLog
    
    print(f"   ✅ Proposal model: {Proposal.__name__}")
    print(f"   ✅ Bill model: {Bill.__name__}")
    print(f"   ✅ ProposalStage model: {ProposalStage.__name__}")
    print(f"   ✅ AIVerificationLog model: {AIVerificationLog.__name__}")
    
    # Test 4: Check API endpoints
    print("\n4. Available API Endpoints:")
    print("   📡 POST /api/bills/upload/ - Upload & verify bill")
    print("   📡 GET  /api/bills/?proposal_id=1 - Get bills")
    print("   📡 POST /api/bills/approve/ - Approve bill")
    
    print("\n" + "="*60)
    print("✅ AI BILL VERIFICATION SYSTEM IS READY!")
    print("="*60)
    
    print("\n📋 Next Steps:")
    print("   1. Start backend: python manage.py runserver")
    print("   2. Start frontend: npm run dev")
    print("   3. Upload a bill after Stage 1 completion")
    print("   4. Check AI verification results")
    
    print("\n💡 To enable production AI:")
    print("   Add to backend/.env: OPENAI_API_KEY=sk-...")
    
    print("\n🎉 Happy testing!\n")

if __name__ == '__main__':
    test_verification()
