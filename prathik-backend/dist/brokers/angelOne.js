"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngelOneBroker = void 0;
// Note: Angel One uses 'smartapi-javascript'
const { SmartAPI } = require('smartapi-javascript');
const encryption_1 = require("../utils/encryption");
class AngelOneBroker {
    smartApi;
    constructor(encryptedApiKey, encryptedJwt) {
        const apiKey = (0, encryption_1.decrypt)(encryptedApiKey);
        const jwtToken = (0, encryption_1.decrypt)(encryptedJwt);
        this.smartApi = new SmartAPI({
            api_key: apiKey
        });
        // Inject the previously generated access token
        this.smartApi.access_token = jwtToken;
    }
    /**
     * Place an automated order via Angel One
     */
    async placeOrder(params) {
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
        }
        catch (error) {
            console.error(`[ANGEL ONE] Error placing order:`, error);
            throw error;
        }
    }
}
exports.AngelOneBroker = AngelOneBroker;
