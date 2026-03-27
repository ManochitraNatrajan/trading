import { KiteConnect } from 'kiteconnect';
import { decrypt } from '../utils/encryption';

export class ZerodhaBroker {
  private kite: KiteConnect;
  
  constructor(encryptedApiKey: string, encryptedAccessToken: string) {
    const apiKey = decrypt(encryptedApiKey);
    const accessToken = decrypt(encryptedAccessToken);

    this.kite = new KiteConnect({
      api_key: apiKey
    });
    
    this.kite.setAccessToken(accessToken);
  }

  /**
   * Places an automated market or limit order with risk constraints
   */
  async placeOrder(params: {
    tradingsymbol: string,
    exchange: string,
    transaction_type: string,
    quantity: number,
    order_type?: string,
    price?: number
  }) {
    try {
      const orderParams = {
        exchange: params.exchange,
        tradingsymbol: params.tradingsymbol,
        transaction_type: params.transaction_type,
        quantity: params.quantity,
        order_type: params.order_type || 'MARKET',
        product: 'MIS', // Intraday
        validity: 'DAY',
        price: params.price
      };

      const response = await this.kite.placeOrder('regular', orderParams);
      console.log(`[ZERODHA] Successfully placed order ${response.order_id} for ${params.tradingsymbol}`);
      return response.order_id;
    } catch (error) {
      console.error(`[ZERODHA] Error placing order:`, error);
      throw error;
    }
  }

  async getPositions() {
    return await this.kite.getPositions();
  }
}
