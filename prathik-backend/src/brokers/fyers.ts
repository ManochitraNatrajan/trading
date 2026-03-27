import axios from 'axios';
import { decrypt } from '../utils/encryption';

export class FyersBroker {
  private appId: string;
  private accessToken: string;
  private static BASE_URL = 'https://api.fyers.in/api/v2';

  constructor(appId: string, encryptedAccessToken: string) {
    this.appId = appId;
    this.accessToken = decrypt(encryptedAccessToken);
  }

  /**
   * Places an automated market or limit order with risk constraints via FYERS API
   */
  async placeOrder(params: {
    symbol: string,
    qty: number,
    type: 1 | 2 | 3 | 4, // 1: Limit, 2: Market, 3: StopLoss, 4: StopLoss-Market
    side: 1 | -1,        // 1: Buy, -1: Sell
    productType: 'INTRADAY' | 'CNC' | 'MARGIN',
    limitPrice?: number,
    stopPrice?: number
  }) {
    try {
      const orderPayload = {
        symbol: params.symbol,
        qty: params.qty,
        type: params.type,
        side: params.side,
        productType: params.productType,
        limitPrice: params.limitPrice || 0,
        stopPrice: params.stopPrice || 0,
        validity: 'DAY',
        disclosedQty: 0,
        offlineOrder: "False",
      };

      const response = await axios.post(`${FyersBroker.BASE_URL}/orders/sync`, orderPayload, {
        headers: {
          'Authorization': `${this.appId}:${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.s === 'ok') {
        console.log(`[FYERS] Successfully placed order ${response.data.id} for ${params.symbol}`);
        return response.data.id;
      } else {
        throw new Error(`[FYERS] Order Failed: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error(`[FYERS] Error placing order:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getPositions() {
    const response = await axios.get(`${FyersBroker.BASE_URL}/positions`, {
      headers: { 'Authorization': `${this.appId}:${this.accessToken}` }
    });
    return response.data;
  }
}
