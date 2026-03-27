# Prathik Full-Stack Trading Architecture

This document answers the core system requirements for the Prathik auto-trading platform utilizing a modern MEAN/MERN stack with FYERS integration.

## 1. System Folder Structure

```text
prathik-workspace/
├── trading-platform/          # React.js (Next.js) Web App
│   ├── src/app                # Pages (Dashboard, Pricing, Admin)
│   └── src/lib/api.ts         # Axios/Fetch integration with Backend
├── prathik-backend/           # Node.js + Express API Server
│   ├── src/models/            # MongoDB Schemas (mongooseSchema.ts)
│   ├── src/brokers/           # fyers.ts (FYERS API Wrapper)
│   ├── src/engine/            # autoTradeEngine.ts (Core logic)
│   ├── src/utils/             # encryption.ts (AES-256 for API keys)
│   ├── .env                   # Configuration mapping
│   └── app.ts                 # Express Entry point
└── prathik-mobile/            # Flutter Mobile App
    ├── lib/screens/           # UI
    └── android/app/...        # Native FLAG_SECURE screenshot blockers
```

## 2. API Endpoints Catalog

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/send-otp` | POST | Triggers Twilio/Msg91 SMS | No |
| `/api/auth/verify` | POST | Verifies OTP and returns JWT | No |
| `/api/broker/fyers-connect` | GET | Redirects user to FYERS OAuth login | Yes (User JWT) |
| `/api/broker/fyers-callback` | POST | Saves encrypted FYERS Access Token to MongoDB | Yes (User JWT) |
| `/api/admin/signal` | POST | Triggers a global BUY/SELL across all users | Yes (Admin JWT) |
| `/api/webhooks/razorpay` | POST | Upgrades user to Premium on payment success | Webhook Sig |
| `/api/user/trades` | GET | Fetches User's MongoDB Trade history | Yes (User JWT) |
| `/api/user/toggle-autotrade` | POST | Turns `autoTradeEnabled` on/off | Yes (User JWT) |

## 3. Deployment Steps

### Backend (Node.js + MongoDB)
1. Provision a **MongoDB Atlas** cluster and obtain the connection string.
2. Spin up a cloud instance (AWS EC2 or Render / DigitalOcean).
3. Set the `.env` variables using `.env.example`.
4. Run `npm install`, then `npm run build`, then `npm start` (usually managed by `PM2` for zero-downtime restarts).
5. Expose via a Reverse Proxy (Nginx) and attach an SSL certificate (Let's Encrypt / Certbot).

### Frontend (React/Next.js)
1. Push `trading-platform` to GitHub.
2. Link the repository to **Vercel** or **AWS Amplify**.
3. Set the `NEXT_PUBLIC_API_URL` environment variable in Vercel to your deployed Node.js backend domain.

### Mobile App (Flutter)
1. Ensure the `FLAG_SECURE` configuration is intact for Android.
2. Build the APK: `flutter build apk --release`.
3. Upload to Google Play Console and Apple App Store Connect.

## 4. Demo Login Credentials

For testing the UI interfaces immediately:
**Web App Demo URL:** `http://localhost:3000` (Assumes Next.js is running)

**Admin Access:**
- Phone: `+91 9999999999`
- OTP: `123456`
- Accesses: `http://localhost:3000/admin`

**Standard User (Trial Mode):**
- Phone: `+91 8888888888`
- OTP: `123456`
- Accesses: `http://localhost:3000/dashboard`

## 5. SEBI Compliance & Risk Management

As requested, the platform includes explicit Risk parameters:
- **Max Loss Per Day**: Defined in MongoDB `User.riskProfile.maxLossPerDay`. The trading engine will skip the user if this limit is breached.
- **Stop Loss Enforcement**: Admin signals mandate a `stopLossPrice` which is sent directly to FYERS as an attached Bracket/Cover order limit, ensuring instantaneous exit at the exchange level.
- **Paper Trading Mode**: Enabled by default (`User.demoModeEnabled = true`). 
- **Disclaimer Component**: A mandatory checkbox stating `"Trading involves risk. No guaranteed profit."` must be accepted during registration before MongoDB flips `isDisclaimerAgreed` to true.
