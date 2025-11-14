# Stage Report AI Verification - Quick Test Guide

## Server Status Check

### 1. Verify Servers Running

Backend (Django):
```bash
# Should see: "Starting development server at http://127.0.0.1:8000/"
netstat -ano | findstr ":8000"  # Should show LISTENING
```

Frontend (Next.js):
```bash
# Should see: "✓ Ready in X.Xs" 
netstat -ano | findstr ":3003"  # Should show LISTENING (or 3001/3002)
```

### 2. Test Backend API

```bash
# Test that API endpoint exists
powershell Invoke-WebRequest -Uri "http://localhost:8000/api/stage-report/analyze/" -Method Options
# Should return 200 OK
```

---

## Manual Test Steps

### Step 1: Create Sample PDF

If you don't have a PDF, create one:
1. Open Notepad
2. Type: "Stage Report - Proposal #1 - Invoice: $5000 - Date: Jan 14, 2025"
3. Save as `test_report.txt`
4. Use an online text-to-PDF converter OR use Python:

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("test_report.pdf", pagesize=letter)
c.drawString(100, 750, "STAGE REPORT - PROPOSAL #1")
c.drawString(100, 700, "Stage: 1")
c.drawString(100, 650, "Amount: $5000 USD")
c.drawString(100, 600, "Date: January 14, 2025")
c.drawString(100, 550, "Vendor: Test Contractor LLC")
c.drawString(100, 500, "Description: Phase 1 Completion")
c.save()
```

### Step 2: Test API with cURL

```bash
# In PowerShell, create the request:
$file = Get-Item "test_report.pdf"
$form = @{
    file = $file
    proposal_id = "1"
    stage_number = "0"
    expected_amount = "5000"
}

# Make the request:
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/stage-report/analyze/" `
    -Method Post `
    -Form $form

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Expected Response:
```json
{
  "success": true,
  "verified": true,
  "confidence": 85,
  "file_hash": "abc123...",
  "analysis": {
    "document_type": "invoice",
    "total_amount": 5000,
    "is_legitimate": true,
    "confidence_score": 85,
    "red_flags": []
  },
  "message": "Stage report analyzed successfully using AI"
}
```

### Step 3: Test Through Frontend UI

1. **Open Dashboard**
   ```
   http://localhost:3003/dashboard
   ```

2. **Navigate to Stage Reports**
   - Scroll down to "Stage Reports" section
   - Should see "Submit Stage Report" form

3. **Select Proposal**
   - Dropdown: "Select Proposal"
   - Choose a proposal (e.g., "Proposal #1 - Stage 1")

4. **Upload PDF**
   - Click file input or drag-drop `test_report.pdf`
   - Should show filename when selected

5. **Submit Report**
   - Click "Submit Report" button
   - Observe progress indicator:
     - Stage 1: AI Analysis (blue spinning)
     - Stage 2: Blockchain (blue spinning)
     - Stage 3: Verification (yellow spinning)
     - Stage 4: Complete (green spinning)

6. **Check Results**
   - Success notification: "✓ Stage completed! Funds released..."
   - Progress bar fills to 100%
   - Form resets for next report

---

## Verification Checks

### Check 1: Backend AI Verification

**Test if AI is analyzing correctly:**

```python
# In Python shell
import requests
import json

url = 'http://localhost:8000/api/stage-report/analyze/'

with open('test_report.pdf', 'rb') as f:
    files = {'file': f}
    data = {
        'proposal_id': '1',
        'stage_number': '0', 
        'expected_amount': '5000'
    }
    response = requests.post(url, files=files, data=data)

result = response.json()

print("Verification Result:")
print(f"  Verified: {result['verified']}")
print(f"  Confidence: {result['confidence']}%")
print(f"  File Hash: {result['file_hash'][:16]}...")
print(f"  Red Flags: {result['analysis'].get('red_flags', [])}")
```

### Check 2: Database Update

**Verify database stored the analysis:**

```bash
# SSH into Django shell
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend
python manage.py shell
```

```python
from APIs.models import ProposalStage
import json

# Find the stage that just submitted
stage = ProposalStage.objects.get(proposal_id=1, stage_number=0)

print("Database stored:")
print(f"  Stage Report Hash: {stage.report[:16]}...")
print(f"  AI Report Length: {len(stage.ai_report)} chars")

# Parse AI report
ai_data = json.loads(stage.ai_report)
print(f"  AI Verified: {ai_data.get('verified')}")
print(f"  AI Confidence: {ai_data.get('confidence')}%")
```

### Check 3: Blockchain Submission

**Verify hash was stored on blockchain:**

```bash
# Check contract events or transaction receipt
# This depends on your contract implementation
# Look for submitStageReport() calls with the file hash
```

---

## Common Issues & Solutions

### Issue: "Connection refused" on localhost:8000

**Solution:**
```bash
# Check if Django is running
netstat -ano | findstr ":8000"

# If not running, start it:
cd backend
python manage.py runserver 8000
```

### Issue: "File upload failed" on POST

**Possible causes:**
- File is not .pdf format
- File size > 10 MB
- Missing 'file' field in form data

**Solution:**
- Check file: `Get-Item test_report.pdf`
- Verify file size: `(Get-Item test_report.pdf).Length`
- Ensure form has 'file' key

### Issue: "verified: false" with red_flags

**This is normal!** It means:
- Document authenticity check failed
- Amount doesn't match expected
- Suspicious patterns detected

**Solution:**
- For testing, OpenAI API might be in mock mode (if OPENAI_API_KEY not set)
- Set OPENAI_API_KEY environment variable for real AI
- Create realistic PDF content

### Issue: "OPENAI_API_KEY not set, using mock verification"

**This is fine for testing!** Mock mode:
- Always verifies as legitimate ✓
- Allows testing the full flow
- No OpenAI API costs

**To use real AI:**
1. Get OpenAI API key from https://platform.openai.com/
2. Set in `backend/.env`: `OPENAI_API_KEY=sk-xxx`
3. Restart Django server

### Issue: 403 Forbidden from Pinata (OLD ERROR)

**This should NOT appear anymore!**

If you still see it:
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Verify frontend code updated: Check StageReports.tsx line 95+
- The old Pinata code should be replaced with AI endpoint

---

## Performance Metrics

### Expected Times

| Stage | Typical Time | Maximum Time |
|-------|-----------|------------|
| PDF Upload | <1s | 3s |
| AI Analysis | 2-5s | 15s |
| Blockchain | 2-10s | 30s |
| Total Flow | 5-15s | 48s |

### Optimization Tips

1. **AI Analysis is slowest**
   - First call: ~5s (API initialization)
   - Subsequent calls: ~2-3s

2. **Reduce PDF size**
   - Compress images if possible
   - Aim for <2 MB PDFs

3. **Batch processing**
   - Don't upload 10 PDFs simultaneously
   - Wait for each to complete

---

## Debug Mode

### Enable Verbose Logging

**Backend:**
```python
# In backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

### Monitor Backend Logs

```bash
# Watch backend server output for errors
# Terminal should show all API calls:
# [14/Nov/2025 11:54:17] POST /api/stage-report/analyze/ HTTP/1.1" 200
```

### Check Frontend Logs

```javascript
// Browser DevTools → Console (F12)
// Should show API responses:
console.log(aiAnalysisResponse.data);
```

---

## Test Report Template

After each test, document:

```markdown
## Test Run - [Date] [Time]

**Environment:**
- Backend: http://localhost:8000 (running ✓)
- Frontend: http://localhost:3003 (running ✓)
- OpenAI Key: (set / not set)

**Test File:**
- Name: test_report.pdf
- Size: X KB
- Content: [description]

**Results:**
- AI Verification: [verified/failed]
- Confidence: X%
- Database Update: [success/fail]
- Blockchain: [success/fail]
- Total Time: X seconds

**Issues:**
- [if any]

**Notes:**
- [additional observations]
```

---

## Success Criteria

✅ **Stage Report AI Verification is working if:**

1. Backend API endpoint responds to POST requests
2. PDF file can be uploaded through form
3. AI analysis completes without errors
4. Response includes: verified, confidence, file_hash
5. Progress indicator shows all 4 stages
6. Database stores file hash and AI report
7. Blockchain transaction succeeds
8. Notification shows "Stage completed"
9. Proposal stage marked as Completed
10. No Pinata API calls in network tab

---

**Ready to test?**

1. Start servers (if not running)
2. Create test PDF
3. Submit through dashboard UI
4. Monitor console/database
5. Verify blockchain

**Questions?** Check the main documentation: `STAGE_REPORT_AI_VERIFICATION.md`
