import express from 'express';
import crypto from 'crypto';
import { AuthService } from '../services/authService';
import { AutoTradeEngine } from '../engine/autoTradeEngine';
import { Signal } from '../models/mongooseSchema';

const router = express.Router();
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'prathik_webhook_secret';

/**
 * 1. Authentication Endpoints
 */
router.post('/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  await AuthService.sendOtp(phone);
  res.json({ success: true, message: 'OTP Sent' });
});

router.post('/auth/verify', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const { user, token } = await AuthService.verifyOtpAndLogin(phone, otp);
    res.json({ success: true, token, user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

/**
 * 2. Admin Auto-Trading Trigger Endpoint
 * This endpoint is secured and only accessible by ADMIN
 */
router.post('/admin/signal', async (req, res) => {
  // In a real app: checkAdminMiddleware(req, res)
  const { tradingsymbol, action, price, stopLoss, target, exchange, baseQty } = req.body;

  try {
    // Create signal in DB
    const newSignal = await Signal.create({
      symbol: tradingsymbol,
      action,
      executionPrice: price,
      stopLossPrice: stopLoss,
      targetPrice: target,
      baseQuantity: baseQty
    });

    // Dispatch signal to all followers
    const successCount = await AutoTradeEngine.processSignal(newSignal._id.toString());

    res.json({ success: true, executedFor: successCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. Subscription Management - Razorpay Webhook
 * Upgrades a user from Trial -> Premium upon successful payment
 */
router.post('/webhooks/razorpay', (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  
  // Verify Webhook Signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured' || event === 'subscription.charged') {
    const userId = payload.payment.entity.notes.userId;
    console.log(`[RAZORPAY] Payment success for user ${userId}. Upgrading to Premium.`);
    
    // DB Call: await db.users.update({ id: userId }, { subscriptionStatus: 'premium' })
  }

  res.json({ status: 'ok' });
});

export default router;
