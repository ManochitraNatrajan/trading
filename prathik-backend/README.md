# Prathik Trading Backend & Deployment Guide

This repository contains the Node.js Express backend and broker integrations for the Prathik auto-trading system.

## 1. Running the Backend

```bash
# 1. Initialize project
npm init -y
npm install express jsonwebtoken kiteconnect smartapi-javascript cors dotenv
npm install -D typescript @types/node @types/express

# 2. Compile and Start
npx tsc
node dist/app.js
```

## 2. Flutter Mobile App Security (Screenshot Prevention)

To build the multi-platform flutter app with screenshot restrictions:

**Android:** 
In `android/app/src/main/kotlin/com/example/prathik/MainActivity.kt`, add:
```kotlin
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // This prevents screenshots and screen recording on Android
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
    }
}
```

**iOS:**
In `ios/Runner/AppDelegate.swift`:
```swift
// iOS doesn't have an OS-level screenshot blocker like Android FLAG_SECURE. 
// However, you can use the `flutter_windowmanager` plugin or manually blur the screen on `applicationWillResignActive`.
```

## 3. Deployment Steps

1. **Database Setup**: Spin up a managed PostgreSQL and Redis instance on AWS (RDS/ElastiCache) or Supabase.
2. **Backend Hosting**: Deploy the Node.js API to a high-availability provider like AWS ECS, Render, or DigitalOcean App Platform. Auto-scaling is critical here during high-frequency signal periods.
3. **Web Hosting**: Deploy the Next.js frontend to Vercel or AWS Amplify.
4. **Networking**: Ensure your backend IP is white-listed with Zerodha/Angel One if required by their API policies.
5. **Webhooks**: Configure Razorpay to send webhooks to `https://api.yourdomain.com/webhooks/razorpay`.

## 4. SEBI Compliance & Important Disclaimers

> **WARNING**: Trading involves significant risk. Software bugs, API rate limits, and market volatility can lead to immense capital loss. 

To maintain compliance and protect your business:
1. **Terms of Service**: Users must explicitly sign (Digital e-Sign preferred) a Risk Disclosure Document stating: *"No guaranteed profit. Trading involves risk. Historical performance is not indicative of future results."*
2. **Registration**: Operating a multi-client copy-trading or auto-signal platform in India often mandates registration with SEBI as an **Investment Adviser (RIA)** or **Portfolio Manager (PMS)** depending on the structure. Consult a lawyer.
3. **Audit Trails**: Ensure the database meticulously logs every Admin Signal, User Execution, and API response time for regulatory audits.
4. **Risk Limits**: Enforce maximum daily loss guardrails and lot size limitations at the software level to protect retail users from catastrophic drawdowns.
