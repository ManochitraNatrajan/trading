"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = exports.Signal = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * USER SCHEMA
 * Manages Authentication, Subscriptions, and FYERS OAuth Tokens
 */
const UserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    // Subscription (Razorpay & Trial)
    subscriptionStatus: { type: String, enum: ['trial', 'premium', 'expired'], default: 'trial' },
    trialExpiresAt: { type: Date, required: true },
    // Auto Trading Core
    autoTradeEnabled: { type: Boolean, default: false },
    demoModeEnabled: { type: Boolean, default: true }, // Paper trading
    // FYERS Integration (Encrypted)
    fyersAppId: { type: String },
    fyersAccessTokenEncrypted: { type: String },
    // Risk Management Constraints
    riskProfile: {
        maxLossPerDay: { type: Number, default: 2000 },
        lotSizeMultiplier: { type: Number, default: 1 },
        currentDailyLoss: { type: Number, default: 0 },
        stopLossPercentage: { type: Number, default: 2.0 }, // 2% default SL
    }
}, { timestamps: true });
/**
 * SIGNAL SCHEMA
 * Admin generated Buy/Sell signals
 */
const SignalSchema = new mongoose_1.default.Schema({
    symbol: { type: String, required: true },
    action: { type: String, enum: ['BUY', 'SELL'], required: true },
    executionPrice: { type: Number, required: true },
    targetPrice: { type: Number, required: true },
    stopLossPrice: { type: Number, required: true },
    baseQuantity: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
/**
 * TRADE EXECUTION SCHEMA
 * Audit trail for every executed trade (Paper or Live)
 */
const TradeSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    signalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Signal', required: true },
    brokerOrderId: { type: String }, // Provided by FYERS
    symbol: { type: String, required: true },
    action: { type: String, required: true },
    quantity: { type: Number, required: true },
    executionPrice: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'EXECUTED', 'FAILED', 'REJECTED_RISK'], required: true },
    isPaperTrade: { type: Boolean, default: false },
    errorMessage: { type: String }
}, { timestamps: true });
exports.User = mongoose_1.default.model('User', UserSchema);
exports.Signal = mongoose_1.default.model('Signal', SignalSchema);
exports.Trade = mongoose_1.default.model('Trade', TradeSchema);
