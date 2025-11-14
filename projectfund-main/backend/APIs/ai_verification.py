"""
AI Bill Verification Service
Verifies bills/receipts uploaded after Stage 1 completion
"""

import os
import base64
import json
import re
from openai import OpenAI
from django.conf import settings

class BillVerificationAI:
    """AI service to verify bills using GPT-4 Vision"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY', '')
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.model = "gpt-4o"  # GPT-4 with vision
        else:
            self.client = None
            print("Warning: OPENAI_API_KEY not set, using mock verification")
    
    def verify_bill(self, image_path, expected_amount, bill_type, stage_number):
        """
        Verify bill using AI vision
        
        Args:
            image_path: Path to uploaded bill image
            expected_amount: Expected amount for this stage
            bill_type: Type of bill (invoice/receipt/quotation)
            stage_number: Current stage number
            
        Returns:
            dict: {
                'verified': bool,
                'confidence': int (0-100),
                'analysis': str,
                'extracted_amount': float,
                'warnings': list,
                'recommendations': str
            }
        """
        
        # If no API key, use mock verification for testing
        if not self.client:
            return self._mock_verification(expected_amount)
        
        try:
            # Read and encode image
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Create detailed prompt
            prompt = f"""
You are an expert financial auditor AI analyzing a bill/invoice/receipt for a public fund management system.

CONTEXT:
- This is Stage {stage_number} of a multi-stage funded project
- Expected Amount: ${expected_amount}
- Expected Document Type: {bill_type}

ANALYSIS REQUIRED:
1. Document Authenticity: Is this a legitimate business document?
2. Total Amount: Extract the exact total amount from the document
3. Date: Extract the document date
4. Vendor/Supplier: Who issued this document?
5. Line Items: List all items/services and their costs
6. Legitimacy Check: Any signs of forgery or manipulation?
7. Amount Match: Does the amount match or reasonably justify the stage budget?
8. Red Flags: Any suspicious elements?

VERIFICATION CRITERIA:
✓ Document must be clear and readable
✓ Amount should match expected within 10% tolerance
✓ Date must be recent (within project timeline)
✓ Vendor information must be present
✓ No signs of tampering or forgery
✓ Line items should be relevant to project description

Respond in JSON format:
{{
    "document_type": "invoice|receipt|quotation|other",
    "total_amount": <number>,
    "currency": "USD|EUR|INR|ETH",
    "date": "YYYY-MM-DD",
    "vendor": "vendor name",
    "vendor_contact": "email or phone if present",
    "line_items": [
        {{"description": "item", "quantity": 1, "unit_price": 0, "total": 0}}
    ],
    "is_legitimate": true|false,
    "is_clear_readable": true|false,
    "red_flags": [],
    "warnings": [],
    "amount_matches": true|false,
    "amount_difference_percent": 0,
    "confidence_score": 0-100,
    "reasoning": "detailed explanation",
    "recommendations": "what authority should verify manually"
}}

Analyze carefully and be thorough. Public funds are at stake.
"""
            
            # Call OpenAI Vision API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500,
                temperature=0.1  # Low temperature for consistent analysis
            )
            
            # Parse response
            content = response.choices[0].message.content
            print(f"AI Response: {content}")
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                analysis_data = json.loads(json_match.group())
            else:
                raise ValueError("Unable to parse AI response as JSON")
            
            # Calculate verification result
            verified = self._calculate_verification(analysis_data, expected_amount)
            
            return {
                'verified': verified,
                'confidence': analysis_data.get('confidence_score', 0),
                'analysis': json.dumps(analysis_data, indent=2),
                'extracted_amount': analysis_data.get('total_amount', 0),
                'warnings': analysis_data.get('warnings', []) + analysis_data.get('red_flags', []),
                'recommendations': analysis_data.get('recommendations', ''),
                'raw_data': analysis_data
            }
            
        except Exception as e:
            print(f"AI Verification Error: {str(e)}")
            return {
                'verified': False,
                'confidence': 0,
                'analysis': f"Error during AI verification: {str(e)}",
                'extracted_amount': 0,
                'warnings': [f"AI verification failed: {str(e)}"],
                'recommendations': 'Manual verification required due to AI processing error'
            }
    
    def _calculate_verification(self, analysis_data, expected_amount):
        """Calculate final verification decision based on AI analysis"""
        
        # Check all verification criteria
        checks = {
            'legitimate': analysis_data.get('is_legitimate', False),
            'readable': analysis_data.get('is_clear_readable', False),
            'amount_match': analysis_data.get('amount_matches', False),
            'confidence': analysis_data.get('confidence_score', 0) >= 70,
            'no_red_flags': len(analysis_data.get('red_flags', [])) == 0
        }
        
        # Amount tolerance check (±10%)
        extracted_amount = analysis_data.get('total_amount', 0)
        if extracted_amount > 0:
            diff_percent = abs((extracted_amount - expected_amount) / expected_amount * 100)
            checks['amount_tolerance'] = diff_percent <= 10
        else:
            checks['amount_tolerance'] = False
        
        # All checks must pass
        verified = all(checks.values())
        
        print(f"Verification Checks: {checks}")
        print(f"Final Verification: {verified}")
        
        return verified
    
    def _mock_verification(self, expected_amount):
        """Mock verification for testing without OpenAI API"""
        return {
            'verified': True,
            'confidence': 85,
            'analysis': json.dumps({
                'document_type': 'invoice',
                'total_amount': expected_amount,
                'currency': 'USD',
                'is_legitimate': True,
                'confidence_score': 85,
                'reasoning': 'Mock verification - OpenAI API not configured'
            }, indent=2),
            'extracted_amount': expected_amount,
            'warnings': ['Using mock verification - Configure OPENAI_API_KEY for real verification'],
            'recommendations': 'Manual verification recommended'
        }
    
    def quick_verify(self, image_path):
        """
        Quick verification without expected amount
        Returns basic document analysis
        """
        if not self.client:
            return {'error': 'OpenAI API not configured'}
        
        try:
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            prompt = """
Analyze this financial document and extract:
1. Document type (invoice/receipt/quotation)
2. Total amount
3. Date
4. Vendor name
5. Is it legitimate?

Return JSON with: document_type, amount, date, vendor, is_legitimate
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {'error': 'Unable to parse document'}
            
        except Exception as e:
            return {'error': str(e)}


# Singleton instance
ai_verifier = BillVerificationAI()
