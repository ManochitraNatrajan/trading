// Note: Angel One uses 'smartapi-javascript'
const { SmartAPI } = require('smartapi-javascript');
import { decrypt } from '../utils/encryption';

export class AngelOneBroker {
  private smartApi: any;

  constructor(encryptedApiKey: string, encryptedJwt: string) {
    const apiKey = decrypt(encryptedApiKey);
    const jwtToken = decrypt(encryptedJwt);

    this.smartApi = new SmartAPI({
      api_key: apiKey
    });
    
    // Inject the previously generated access token
    this.smartApi.access_token = jwtToken;
  }

  /**
   * Place an automated order via Angel One
   */
  async placeOrder(params: {
    tradingsymbol: string,
    symboltoken: string,
    exchange: string,
    transaction_type: string,
    quantity: number
  }) {
    try {
      const orderParams = {
        variety: "NORMAL",
        tradingsymbol: params.tradingsymbol,
        symboltoken: params.symboltoken, // Angel One requires unique symbol tokens
        transactiontype: params.transaction_type,
        exchange: params.exchange,
        ordertype: "MARKET",
        producttype: "INTRADAY",
        duration: "DAY",
        quantity: params.quantity
      };

      const response = await this.smartApi.placeOrder(orderParams);
      console.log(`[ANGEL ONE] Successfully placed order: ${response.data.orderid}`);
      return response.data.orderid;
    } catch (error) {
      console.error(`[ANGEL ONE] Error placing order:`, error);
      throw error;
    }
  }
}
