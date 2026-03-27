"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FyersBroker = void 0;
const axios_1 = __importDefault(require("axios"));
const encryption_1 = require("../utils/encryption");
class FyersBroker {
    appId;
    accessToken;
    static BASE_URL = 'https://api.fyers.in/api/v2';
    constructor(appId, encryptedAccessToken) {
        this.appId = appId;
        this.accessToken = (0, encryption_1.decrypt)(encryptedAccessToken);
    }
    /**
     * Places an automated market or limit order with risk constraints via FYERS API
     */
    async placeOrder(params) {
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
            const response = await axios_1.default.post(`${FyersBroker.BASE_URL}/orders/sync`, orderPayload, {
                headers: {
                    'Authorization': `${this.appId}:${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.s === 'ok') {
                console.log(`[FYERS] Successfully placed order ${response.data.id} for ${params.symbol}`);
                return response.data.id;
            }
            else {
                throw new Error(`[FYERS] Order Failed: ${response.data.message}`);
            }
        }
        catch (error) {
            console.error(`[FYERS] Error placing order:`, error.response?.data || error.message);
            throw error;
        }
    }
    async getPositions() {
        const response = await axios_1.default.get(`${FyersBroker.BASE_URL}/positions`, {
            headers: { 'Authorization': `${this.appId}:${this.accessToken}` }
        });
        return response.data;
    }
}
exports.FyersBroker = FyersBroker;
