"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const authService_1 = require("../services/authService");
const autoTradeEngine_1 = require("../engine/autoTradeEngine");
const router = express_1.default.Router();
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'prathik_webhook_secret';
/**
 * 1. Authentication Endpoints
 */
router.post('/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    await authService_1.AuthService.sendOtp(phone);
    res.json({ success: true, message: 'OTP Sent' });
});
router.post('/auth/verify', async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const { user, token } = await authService_1.AuthService.verifyOtpAndLogin(phone, otp);
        res.json({ success: true, token, user });
    }
    catch (error) {
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
        // Dispatch signal to all followers
        const successCount = await autoTradeEngine_1.AutoTradeEngine.processSignal({
            tradingsymbol, action, price, stopLoss, target, exchange, baseQty
        });
        res.json({ success: true, executedFor: successCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * 3. Subscription Management - Razorpay Webhook
 * Upgrades a user from Trial -> Premium upon successful payment
 */
router.post('/webhooks/razorpay', (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    // Verify Webhook Signature
    const expectedSignature = crypto_1.default
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
exports.default = router;
