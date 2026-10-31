# Owntemp (v1.0.0) 🛡️
> **সম্পূর্ণ ফ্রি ডিসপোজেবল ইমেইল ইঞ্জিন — কাস্টম ডোমেইন, লাইফটাইম পার্মানেন্ট ইনবক্স লক এবং স্বয়ংক্রিয় ওটিপি (OTP) পার্সার সহ।**
> *Free Disposable Temp Mail Engine with Custom Business Domain, Lifetime Permanent Inbox Lock & Instant OTP Parser.*

---

## 🌟 মূল সুবিধাসমূহ (Core Features)

1. **সম্পূর্ণ ফ্রি কাস্টম ডোমেইন সাপোর্ট (xyz@yourbusiness.com):**
   - Cloudflare Email Routing (Catch-all) ও Workers ব্যবহার করে নিজের যেকোনো ডোমেইনে ফ্রি ইমেইল রিসিভিং।
   - যেকোনো নাম বা ইউজারনেম ইনস্ট্যান্ট সেট করে ইনবক্স ব্যবহার করা যায়।

2. **লাইফটাইম লক বাটন (Lifetime Lock Protection):**
   - সাধারণ টেম্প মেইল নির্ধারিত সময় পর স্বয়ংক্রিয়ভাবে মুছে যায়।
   - কিন্তু **🔒 Lock Lifetime** বাটন চাপলে এবং সিকিউরিটি পিন সেট করলে ইনবক্সটি ডাটাবেসে চিরস্থায়ী হয়ে যায়। অটো-ক্লিনার বা ব্যাকগ্রাউন্ড জব এটি কখনো ডিলিট করবে না।

3. **স্বয়ংক্রিয় ওটিপি (OTP) ও ভেরিফিকেশন লিংক নিষ্কাশন:**
   - ইনকামিং মেইল থেকে ৪-৮ ডিজিটের সিকিউরিটি কোড স্বয়ংক্রিয়ভাবে ডিটেক্ট করে হাইলাইট চিপে এক-ক্লিকে কপি করার সুবিধা।
   - অ্যাক্টিভেশন/ভেরিফিকেশন লিংক সরাসরি ওয়ান-ক্লিক বাটন আকারে প্রদর্শন।

4. **মাল্টি-প্ল্যাটফর্ম সাপোর্ট (Multi-Platform Parity):**
   - 🌐 **Web App:** Vercel ও যেকোনো Node.js হোস্টিংয়ের জন্য প্রস্তুত।
   - 📱 **Android APK:** রিলিজ সাইনড APK বিল্ড ওয়ার্কফ্লো।
   - 💻 **Windows PC (.exe):** পোর্টেবল ও ইনস্টলার প্যাকেজ।
   - 🍎 **macOS Universal:** Intel (x86_64) ও Apple Silicon (M1/M2/M3/M4) সাপোর্ট।

5. **ভার্সন প্যারিটি ও রিয়েল-টাইম এপিআই:**
   - `/api/app/version` — সিনক্রোনাইজড ভার্সন ট্র্যাকিং।
   - `/api/inbound/webhook` — Cloudflare ও বাহ্যিক এসএমটিপি রিসিভার।
   - `/api/inbox/[address]` — রিয়েল-টাইম ইনবক্স রিট্রিভাল।
   - `/api/simulate` — তাৎক্ষণিক লাইভ টেস্ট ইমেইল জেনারেটর।

---

## 🚀 লোকাল সার্ভার চালানোর নির্দেশিকা (Run Locally)

```bash
# ১. ডিপেনডেন্সি ইনস্টল (ইতিমধ্যে ইনস্টল করা হয়েছে)
npm install

# ২. লোকাল ডেভেলপমেন্ট সার্ভার চালু
npm run dev

# ৩. প্রজেক্ট ব্রাউজারে দেখতে:
http://localhost:3000
```

---

## 🌐 ক্লাউডফ্লেয়ার ফ্রি ক্যাচ-অল সেটআপ (Cloudflare Email Routing)

1. আপনার Cloudflare অ্যাকাউন্টে আপনার ডোমেইনে যান (`yourbusiness.com`)।
2. বামদিকের মেনু থেকে **Email** -> **Email Routing** এ ক্লিক করে এনাবল করুন।
3. **Catch-all address** অপশনে যান এবং রুল সেট করুন:
   - **Action:** Send to a Worker
   - **Worker:** `Owntemp Email Worker` (কোডটি `cloudflare-worker/email-worker.js` এ রয়েছে)।
4. Worker-এর Environment Variable-এ `API_ENDPOINT` দিন:
   `https://your-app.vercel.app/api/inbound/webhook`

এখন যে কেউ `যেকোনো_নাম@yourbusiness.com` এ ইমেইল পাঠালে তা সেকেন্ডের মধ্যে আপনার Owntemp অ্যাপে চলে আসবে!

---

## 📦 ভার্সন তথ্য (Version Information)

- **বর্তমান ভার্সন:** `v1.0.0`
- **এপিআই এন্ডপয়েন্ট:** `/api/app/version`
- **লাইসেন্স:** MIT
