"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZerodhaBroker = void 0;
const kiteconnect_1 = require("kiteconnect");
const encryption_1 = require("../utils/encryption");
class ZerodhaBroker {
    kite;
    constructor(encryptedApiKey, encryptedAccessToken) {
        const apiKey = (0, encryption_1.decrypt)(encryptedApiKey);
        const accessToken = (0, encryption_1.decrypt)(encryptedAccessToken);
        this.kite = new kiteconnect_1.KiteConnect({
            api_key: apiKey
        });
        this.kite.setAccessToken(accessToken);
    }
    /**
     * Places an automated market or limit order with risk constraints
     */
    async placeOrder(params) {
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
        }
        catch (error) {
            console.error(`[ZERODHA] Error placing order:`, error);
            throw error;
        }
    }
    async getPositions() {
        return await this.kite.getPositions();
    }
}
exports.ZerodhaBroker = ZerodhaBroker;
