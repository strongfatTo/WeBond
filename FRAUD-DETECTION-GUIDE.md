# 🛡️ WeBond Fraud & Risk Detection System

## Overview

WeBond implements a **zero-tolerance policy** for illegal activities including gambling, sexual services, and drug-related transactions. Our AI-powered fraud detection system monitors all task content and chat communications in real-time to protect users and comply with Hong Kong law.

---

## 🚨 Critical Violations (Immediate Action)

### Detected Categories

#### 1. **Gambling Activities** 🎰
**Keywords Monitored:**
- English: gambling, casino, bet, poker, lottery, slot machine, baccarat, blackjack, roulette
- Chinese: 赌, 博彩, 投注

**Examples of Violations:**
- ❌ "Looking for someone to help with online casino gambling"
- ❌ "Need guide for poker games in Macau"
- ❌ "Help me place bets on football matches"

---

#### 2. **Sexual Services** 🚫
**Keywords Monitored:**
- English: prostitution, escort, sex service, massage service, adult service, companionship for money, sugar
- Chinese: 性服务, 援交, 色情

**Examples of Violations:**
- ❌ "Need escort service for business dinner"
- ❌ "Looking for companionship, will pay well"
- ❌ "Massage service with special services"

---

#### 3. **Drug Trafficking** 💊
**Keywords Monitored:**
- English: drug, cocaine, heroin, marijuana, weed, cannabis, ecstasy, mdma, meth, pills, prescription drug
- Chinese: 毒品, 大麻, 可卡因

**Examples of Violations:**
- ❌ "Can you help me get some weed?"
- ❌ "Need prescription drugs without prescription"
- ❌ "Looking for someone to deliver cannabis"

---

## ⚡ Immediate Actions Taken

When illegal content is detected, the system **automatically** executes the following:

### 1. **Task Rejection & Blocking** 
- ❌ Task is immediately REJECTED
- 🚫 Content is BLOCKED from being posted
- ⏱️ Happens in real-time (< 1 second)

### 2. **Evidence Collection** 📸
- 💾 Full content saved to secure evidence database
- 🔐 Encrypted and immutable storage
- 📋 Case ID generated (e.g., `#WB1729624391234`)
- ⏰ Timestamp recorded with user metadata

### 3. **Account Flagging** ⚠️
- 🔴 Both parties' accounts flagged for review
- 📊 Violation logged in user profile
- 🎯 Risk score updated
- 🔍 Account placed under enhanced monitoring

### 4. **Security Team Alert** 👮
- 📧 Immediate notification to platform security team
- 🚨 High-priority ticket created
- 📑 Evidence package compiled for review
- ⚖️ Legal team notified for serious cases

### 5. **User Warning System** 📣
**First Violation:**
- ⚠️ Severe warning displayed to both parties
- 📝 Notice saved to user's compliance record
- ⏰ 48-hour review period initiated

**Repeat Violations:**
- 🚫 **Permanent account suspension**
- 📋 Evidence submitted to Hong Kong Police
- ⚖️ Potential criminal prosecution
- 💳 Payment processing permanently disabled

---

## 📋 Warning Message Template

When critical content is detected, both parties receive:

```
🚨 SEVERE WARNING - CRITICAL VIOLATION DETECTED

This task contains content related to illegal activities prohibited by Hong Kong law.

IMMEDIATE ACTIONS TAKEN:
❌ Task automatically REJECTED and BLOCKED
📸 Content saved as evidence (Case ID: #WB1729624391234)
⚠️ Both parties' accounts flagged for review
👮 Content forwarded to platform security team
🚫 Repeat violations will result in permanent ban + legal reporting

IF YOU PROCEED WITH THIS ACTIVITY:
• Your account will be PERMANENTLY BANNED
• Evidence will be submitted to Hong Kong Police
• You may face criminal prosecution

🚨 WeBond has ZERO TOLERANCE for illegal activities.
All content is monitored and recorded.
```

---

## 🔄 Processing Flow

```
User Posts Task/Message
        ↓
[AI Fraud Detection Engine]
        ↓
Keyword Matching (Gambling/Sex/Drugs)
        ↓
     Violation?
    /         \
  YES          NO
   ↓            ↓
CRITICAL      Continue
  ALERT        Normal
   ↓          Process
Immediate Actions:
• Block content
• Generate Case ID
• Save evidence
• Flag accounts
• Alert security
• Warn users
```

---

## 🧪 Testing the System

### Try the AI Demo
Visit **`ai-demo.html`** and test the Fraud & Risk Detection module:

**Test Scenarios:**

1. **Gambling Test** 🎰
   ```
   Looking for someone to help with online casino gambling in Macau. 
   Need guide for poker games.
   ```
   → Expected: CRITICAL VIOLATION detected

2. **Sex Services Test** 🚫
   ```
   Need escort service for business dinner. 
   Offering HKD 2000 for companionship.
   ```
   → Expected: CRITICAL VIOLATION detected

3. **Drugs Test** 💊
   ```
   Can you help me get some weed or marijuana? Will pay well.
   ```
   → Expected: CRITICAL VIOLATION detected

4. **Safe Content Test** ✅
   ```
   Need help with visa application. 
   Prefer Cantonese speaker to accompany me to Immigration Department.
   ```
   → Expected: LOW RISK - approved

---

## 📊 Risk Levels

| Level | Badge Color | Action | Example |
|-------|------------|--------|---------|
| **CRITICAL** 🔴 | Red (Pulsing) | Immediate block + evidence collection | Gambling, drugs, sex services |
| **HIGH** 🟠 | Orange | Flag for review | Academic fraud, money laundering |
| **MEDIUM** 🟡 | Yellow | Request clarification | Exam help (unclear intent) |
| **LOW** 🟢 | Green | Approved | Normal tasks |

---

## ⚖️ Legal Compliance

### Hong Kong Laws Referenced:
- **Gambling Ordinance (Cap. 148)** - Prohibits illegal gambling activities
- **Dangerous Drugs Ordinance (Cap. 134)** - Criminalizes drug trafficking
- **Crimes Ordinance (Cap. 200)** - Prohibits prostitution and related activities
- **Personal Data (Privacy) Ordinance (PDPO)** - Data protection compliance

### Evidence Handling:
- All evidence collected in compliance with PDPO
- Secure encrypted storage with access logging
- Evidence retention: 7 years (legal requirement)
- Chain of custody maintained for legal proceedings

---

## 🔐 Privacy & Data Protection

**What We Monitor:**
- ✅ Task descriptions (public content)
- ✅ Task titles (public content)
- ✅ Chat messages between matched parties

**What We DON'T Monitor:**
- ❌ Private profile information
- ❌ Payment card details
- ❌ Unrelated conversations

**User Rights:**
- Right to know if flagged (within 48 hours)
- Right to appeal (7-day window)
- Right to evidence disclosure (if legally permissible)

---

## 🚀 Implementation in Production

### Backend Integration

```javascript
// Example: Task creation with fraud check
POST /api/tasks
{
  "title": "Task title",
  "description": "Task description",
  ...
}

// Backend process:
1. Receive task data
2. Run AI fraud detection
3. If CRITICAL: 
   - Return 403 Forbidden
   - Log to evidence DB
   - Flag user account
   - Alert security team
4. If safe: Create task
```

### Real-time Chat Monitoring

```javascript
// WebSocket message handler
socket.on('message', async (data) => {
  const riskAnalysis = await fraudDetection.analyze(data.content);
  
  if (riskAnalysis.risk === 'critical') {
    // Block message
    socket.emit('message_blocked', {
      reason: 'Critical violation detected',
      caseId: riskAnalysis.caseId,
      warning: SEVERE_WARNING_TEXT
    });
    
    // Alert both parties
    notifySecurityTeam(riskAnalysis);
    flagUserAccounts([data.senderId, data.recipientId]);
    
    return; // Don't deliver message
  }
  
  // Safe message - deliver normally
  deliverMessage(data);
});
```

---

## 📈 Metrics & Monitoring

### Key Performance Indicators:
- **Detection Rate**: % of illegal content caught
- **False Positive Rate**: % of safe content incorrectly flagged
- **Response Time**: Time from detection to action (target: <1s)
- **Appeal Success Rate**: % of appeals upheld

### Dashboard Alerts:
- Real-time critical violation count
- User accounts flagged today
- Cases pending review
- Repeat offender tracking

---

## 🔄 Continuous Improvement

### Keyword Database Updates:
- Monthly review of new slang/code words
- Quarterly legal compliance audit
- Community reporting integration
- ML model retraining (quarterly)

### False Positive Reduction:
- Context analysis (e.g., "drug store" vs "drugs")
- Language nuance handling
- User appeal feedback loop

---

## 📞 Contact Security Team

**For Urgent Violations:**
- Email: security@webond.hk
- Emergency Hotline: +852 XXXX-XXXX
- Response Time: < 1 hour for critical cases

**For Appeals:**
- Email: appeals@webond.hk
- Response Time: 48-72 hours
- Include Case ID in subject line

---

## ✅ Best Practices for Users

### DO:
- ✅ Use clear, honest task descriptions
- ✅ Report suspicious content you encounter
- ✅ Review platform guidelines regularly
- ✅ Contact support if unsure about content

### DON'T:
- ❌ Use coded language to bypass detection
- ❌ Share external contact info for illegal transactions
- ❌ Create multiple accounts after being flagged
- ❌ Encourage others to violate policies

---

**Last Updated**: October 23, 2025  
**Version**: 1.0  
**Status**: Active

**Built with ❤️ for a safe Hong Kong community**
