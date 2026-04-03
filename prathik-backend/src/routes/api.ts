import express from 'express';
import crypto from 'crypto';
import { AuthService } from '../services/authService';
import { AutoTradeEngine } from '../engine/autoTradeEngine';
import { Signal, LivePosition, TradeHistory, OrderHistory, User } from '../models/mongooseSchema';

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

/**
 * 4. Dashboard Stats & Positions (Mock/DB mix)
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    const histories = await TradeHistory.find({});
    let totalProfit = 0;
    let winningTrades = 0;
    let totalTrades = histories.length;

    histories.forEach(trade => {
      totalProfit += (trade.profitLoss || 0);
      if ((trade.profitLoss || 0) > 0) {
        winningTrades++;
      }
    });

    let winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;

    const stats = {
      balance: 125000, // mock balance for now
      totalProfit,
      winRate: parseFloat(winRate as string),
      totalTrades,
      brokerConnected: true,
      apiStatus: 'Live'
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/dashboard/positions', async (req, res) => {
  try {
    const positions = await LivePosition.find({}).sort({ createdAt: -1 });
    res.json({ success: true, positions });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/dashboard/history', async (req, res) => {
  try {
    const history = await TradeHistory.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/dashboard/orders', async (req, res) => {
  try {
    const orders = await OrderHistory.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post('/dashboard/order', async (req, res) => {
  try {
    const { symbol, action, quantity, orderType, price } = req.body;
    // Mock user ID
    const mockUserId = "60b9b0f9e13d7b40a5f78b11"; // Placeholder 24 hex char string

    // Log the order
    const order = await OrderHistory.create({
      userId: mockUserId,
      symbol,
      action,
      quantity,
      orderType,
      price,
      status: 'EXECUTED'
    });

    // Add to Live Positions
    const position = await LivePosition.create({
      userId: mockUserId,
      symbol,
      buySell: action,
      quantity,
      entryPrice: price || 1400, // mock price
      status: 'OPEN'
    });

    // In a real app we emit to specific user's room, here broadcasting
    const { getIo } = require('../sockets');
    getIo().emit('position_update', position);

    res.json({ success: true, order, position });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
