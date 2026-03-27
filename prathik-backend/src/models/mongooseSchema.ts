import mongoose from 'mongoose';

/**
 * USER SCHEMA
 * Manages Authentication, Subscriptions, and FYERS OAuth Tokens
 */
const UserSchema = new mongoose.Schema({
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
const SignalSchema = new mongoose.Schema({
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
const TradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signal', required: true },
  brokerOrderId: { type: String }, // Provided by FYERS
  symbol: { type: String, required: true },
  action: { type: String, required: true },
  quantity: { type: Number, required: true },
  executionPrice: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'EXECUTED', 'FAILED', 'REJECTED_RISK'], required: true },
  isPaperTrade: { type: Boolean, default: false },
  errorMessage: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Signal = mongoose.model('Signal', SignalSchema);
export const Trade = mongoose.model('Trade', TradeSchema);
