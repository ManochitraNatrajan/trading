import { FyersBroker } from '../brokers/fyers';
import { User, Trade, Signal } from '../models/mongooseSchema';

export class AutoTradeEngine {
  
  /**
   * Admin triggered signal: Distribute to all FYERS users with auto trade enabled
   */
  static async processSignal(signalId: string) {
    const signal = await Signal.findById(signalId);
    if (!signal) throw new Error("Signal not found");

    console.log(`[ENGINE] Processing New Admin Signal: ${signal.action} ${signal.symbol}`);

    // Fetch active users linked to FYERS with autoTrading enabled
    // Only premium users or users with an active trial receive live trades
    const activeUsers = await User.find({
      autoTradeEnabled: true,
      $or: [
        { subscriptionStatus: 'premium' },
        { subscriptionStatus: 'trial', trialExpiresAt: { $gt: new Date() } }
      ],
      fyersAppId: { $exists: true }
    });

    const promises = activeUsers.map(user => this.executeForUser(user.toObject(), signal.toObject()));
    const results = await Promise.allSettled(promises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[ENGINE] FYERS Execution Complete. Success: ${successCount}/${activeUsers.length}`);
    
    return successCount;
  }

  private static async executeForUser(user: any, signal: any) {
    try {
      // 1. Check Risk Rules
      if (!this.checkRiskRules(user, signal)) {
        // Log rejection
        await Trade.create({
          userId: user._id, signalId: signal._id, symbol: signal.symbol, action: signal.action,
          quantity: signal.baseQuantity, executionPrice: signal.executionPrice,
          status: 'REJECTED_RISK', errorMessage: 'Daily loss limit reached or risk invalid'
        });
        return;
      }

      const calculatedQty = signal.baseQuantity * user.riskProfile.lotSizeMultiplier;

      // 2. Paper Trading (Demo Mode) Check
      if (user.demoModeEnabled) {
        await Trade.create({
          userId: user._id, signalId: signal._id, symbol: signal.symbol, action: signal.action,
          quantity: calculatedQty, executionPrice: signal.executionPrice,
          status: 'EXECUTED', isPaperTrade: true
        });
        console.log(`[MOCK] Paper trade executed for ${user.name}`);
        return;
      }

      // 3. Live Trading via FYERS
      const broker = new FyersBroker(user.fyersAppId, user.fyersAccessTokenEncrypted);
      
      const orderId = await broker.placeOrder({
        symbol: signal.symbol,
        qty: calculatedQty,
        type: 2, // Market Order
        side: signal.action === 'BUY' ? 1 : -1,
        productType: 'INTRADAY',
        stopPrice: signal.stopLossPrice
      });

      // 4. Save Real Execution to MongoDB
      await Trade.create({
        userId: user._id, signalId: signal._id, symbol: signal.symbol, action: signal.action,
        quantity: calculatedQty, executionPrice: signal.executionPrice,
        status: 'EXECUTED', isPaperTrade: false, brokerOrderId: orderId
      });

      // 5. Trigger Firebase Push Notification Here
      // await NotificationService.send(user.fyersAppId, `Trade Executed: ${signal.action} ${signal.symbol}`);

    } catch (error: any) {
      await Trade.create({
        userId: user._id, signalId: signal._id, symbol: signal.symbol, action: signal.action,
        quantity: signal.baseQuantity, executionPrice: signal.executionPrice,
        status: 'FAILED', errorMessage: error.message
      });
      throw error;
    }
  }

  private static checkRiskRules(user: any, signal: any): boolean {
    if (user.riskProfile.currentDailyLoss >= user.riskProfile.maxLossPerDay) return false;
    return true;
  }
}
