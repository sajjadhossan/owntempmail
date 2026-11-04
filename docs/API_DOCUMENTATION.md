# Owntemp Developer API v1 Documentation

> **Version:** `2.5.3`  
> **Base URL:** `http://localhost:3000` or `https://your-domain.com`  
> **OpenAPI JSON Spec:** `/api/docs`  
> **Postman Collection:** `docs/owntemp_postman_collection.json`

---

## 📌 ১. ওভারভিউ (Overview)
Owntemp একটি বাণিজ্যিক গ্রেডের ডিসপোজেবল টেম্প মেইল ও ওটিপি রিসিভার ইঞ্জিন। ডেভেলপাররা তাদের অটোমেটেড কিউএ টেস্টিং (Cypress, Playwright, Selenium, Puppeteer), ইউজার রেজিস্ট্রেশন অটোমেশন এবং মোবাইল অ্যাপ সাইন-আপ টেস্টের জন্য এই এপিআই ব্যবহার করতে পারেন।

---

## 🚀 ২. এপিআই এন্ডপয়েন্টসমূহ (Endpoints)

### ১. নতুন ইনবক্স তৈরি করা (Create Temp Inbox)
- **পদ্ধতি (Method):** `POST`
- **এন্ডপয়েন্ট:** `/api/v1/inbox`
- **হেডার:** `Content-Type: application/json`
- **অনুরোধের বডি (Request Body):**
```json
{
  "prefix": "test_bot_99",
  "domain": "owntemp.live"
}
```
- **সফল রেসপন্স (201 Created):**
```json
{
  "success": true,
  "message": "Developer inbox generated successfully",
  "data": {
    "address": "test_bot_99@owntemp.live",
    "prefix": "test_bot_99",
    "domain": "owntemp.live",
    "createdAt": "2026-11-04T05:30:00.000Z",
    "feedUrl": "/api/v1/inbox/test_bot_99%40owntemp.live/messages",
    "otpUrl": "/api/v1/inbox/test_bot_99%40owntemp.live/otp",
    "streamUrl": "/api/inbox/test_bot_99%40owntemp.live/stream"
  },
  "errors": []
}
```

---

### ২. ইনবক্সের সমস্ত মেসেজ দেখা (Get Inbox Messages)
- **পদ্ধতি (Method):** `GET`
- **এন্ডপয়েন্ট:** `/api/v1/inbox/{address}/messages`
- **উদাহরণ:** `/api/v1/inbox/test_bot_99@owntemp.live/messages`
- **সফল রেসপন্স (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 1 messages for test_bot_99@owntemp.live",
  "data": {
    "address": "test_bot_99@owntemp.live",
    "totalEmails": 1,
    "isLocked": false,
    "latestOtp": "492817",
    "emails": [
      {
        "id": "em_1762235948_abc",
        "sender": "no-reply@accounts.google.com",
        "senderName": "Google Security",
        "subject": "Your Google Verification Code is 492817",
        "textBody": "Use 492817 to verify your new account.",
        "htmlBody": "<p>Use <b>492817</b> to verify your new account.</p>",
        "otpCode": "492817",
        "verificationLinks": ["https://accounts.google.com/verify?token=xyz"],
        "attachmentsCount": 0,
        "receivedAt": "2026-11-04T05:31:00.000Z"
      }
    ]
  }
}
```

---

### ৩. অটোমেশন টেস্টিংয়ের জন্য তাৎক্ষণিক ওটিপি পোলিং (Instant OTP Poller for CI/CD)
- **পদ্ধতি (Method):** `GET`
- **এন্ডপয়েন্ট:** `/api/v1/inbox/{address}/otp?timeout=10`
- **কোয়েরি প্যারামিটারসমূহ:**
  - `timeout`: (ঐচ্ছিক) সর্বোচ্চ ১৫ সেকেন্ড পর্যন্ত লং-পোলিং। ইমেইল এখনো না এসে থাকলে আসার সাথে সাথে রিটার্ন করবে।
  - `since`: (ঐচ্ছিক) নির্দিষ্ট ISO টাইমস্ট্যাম্পের পরের ওটিপি ফিল্টার করতে।
- **সফল রেসপন্স (200 OK):**
```json
{
  "success": true,
  "message": "OTP retrieved successfully for test_bot_99@owntemp.live",
  "data": {
    "address": "test_bot_99@owntemp.live",
    "otp": "492817",
    "subject": "Your Google Verification Code is 492817",
    "sender": "no-reply@accounts.google.com",
    "senderName": "Google Security",
    "receivedAt": "2026-11-04T05:31:00.000Z",
    "verificationLinks": ["https://accounts.google.com/verify?token=xyz"],
    "emailId": "em_1762235948_abc",
    "isLocked": false
  },
  "meta": {
    "totalEmails": 1
  },
  "errors": []
}
```

---

### ৪. ইনবাউন্ড ওয়েবহুক রিসিভার (Inbound Webhook Receiver)
- **পদ্ধতি (Method):** `POST`
- **এন্ডপয়েন্ট:** `/api/inbound/webhook`
- **অথেনটিকেশন:** `WEBHOOK_SECRET` সেট করা থাকলে `x-webhook-secret` অথবা `Authorization: Bearer <token>`
- **অনুরোধের বডি (Request Body):**
```json
{
  "to": "test_bot_99@owntemp.live",
  "from": "auth@mywebsite.com",
  "senderName": "Auth Service",
  "subject": "Verify your email (OTP: 839210)",
  "text": "Your verification passcode is 839210."
}
```

---

### ৫. ডিসপোজেবল আউটবাউন্ড রিপ্লাই প্রেরণ (Send Disposable Reply)
- **পদ্ধতি (Method):** `POST`
- **এন্ডপয়েন্ট:** `/api/inbox/send`
- **অনুরোধের বডি (Request Body):**
```json
{
  "from": "test_bot_99@owntemp.live",
  "to": "support@external.com",
  "subject": "Re: Verification Notice",
  "textBody": "Thank you, I have completed the account setup!"
}
```

---

### ৬. লাইভ ক্লাউডফ্লেয়ার ও ওয়েবহুক ডায়াগনস্টিক (Live Diagnostic Probe)
- **পদ্ধতি (Method):** `POST` অথবা `GET`
- **এন্ডপয়েন্ট:** `/api/cloudflare/test`
- **কাজ:** পার্সার ইঞ্জিন, ওটিপি রেজেক্স, ভেরিফিকেশন লিঙ্ক ডিটেকশন এবং ডাটাবেজ রাউন্ডট্রিপ ল্যাটেন্সি পরীক্ষা করে।

---

## 💻 ৩. প্রোগ্রামিং কোড এক্সাম্পল (Code Examples)

### JavaScript / Playwright টেস্ট কোড:
```javascript
const axios = require('axios');

async function getLatestOtp(emailAddress) {
  const response = await axios.get(
    `https://your-domain.com/api/v1/inbox/${encodeURIComponent(emailAddress)}/otp?timeout=15`
  );
  if (response.data.success) {
    console.log('Detected OTP:', response.data.data.otp);
    return response.data.data.otp;
  }
  throw new Error('OTP not arrived');
}
```

### Python টেস্ট কোড:
```python
import requests

def fetch_otp(address):
    url = f"https://your-domain.com/api/v1/inbox/{address}/otp?timeout=10"
    res = requests.get(url)
    if res.status_code == 200:
        data = res.json()
        return data["data"]["otp"]
    return None

otp = fetch_otp("test_bot_99@owntemp.live")
print(f"Verified OTP Code: {otp}")
```

### cURL কমান্ড:
```bash
# 1. Generate Inbox
curl -X POST http://localhost:3000/api/v1/inbox \
  -H "Content-Type: application/json" \
  -d '{"prefix": "qa_user", "domain": "owntemp.live"}'

# 2. Poll OTP
curl http://localhost:3000/api/v1/inbox/qa_user@owntemp.live/otp?timeout=10
```

