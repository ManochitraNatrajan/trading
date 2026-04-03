import axios from 'axios';
import { decrypt } from '../utils/encryption';

export class UpstoxBroker {
  private accessToken: string;
  private static BASE_URL = 'https://api-v2.upstox.com';

  constructor(encryptedAccessToken: string) {
    this.accessToken = decrypt(encryptedAccessToken);
  }

  /**
   * Place an automated order via Upstox
   */
  async placeOrder(params: {
    tradingsymbol: string,
    exchange: string,
    transaction_type: 'BUY' | 'SELL',
    quantity: number,
    order_type?: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M',
    price?: number
  }) {
    try {
      const orderPayload = {
        quantity: params.quantity,
        product: 'D', // I = Intraday, D = Delivery. Using Delivery for demo
        validity: 'DAY',
        price: params.price || 0,
        tag: 'prathik_algo',
        instrument_token: `NSE_EQ|${params.tradingsymbol}`, // Assuming NSE Equity symbol formats
        order_type: params.order_type || 'MARKET',
        transaction_type: params.transaction_type,
        disclosed_quantity: 0,
        trigger_price: 0,
        is_amo: false
      };

      const response = await axios.post(`${UpstoxBroker.BASE_URL}/order/place`, orderPayload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        console.log(`[UPSTOX] Successfully placed order ${response.data.data.order_id}`);
        return response.data.data.order_id;
      } else {
        throw new Error(`[UPSTOX] Order Failed: ${JSON.stringify(response.data.errors)}`);
      }
    } catch (error: any) {
      console.error(`[UPSTOX] Error placing order:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getPositions() {
    const response = await axios.get(`${UpstoxBroker.BASE_URL}/portfolio/short-term-positions`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Accept': 'application/json' }
    });
    return response.data;
  }
}
