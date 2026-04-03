const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = {
  async sendOtp(phone: string) {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  async verifyOtp(phone: string, otp: string) {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    return res.json();
  },

  async sendAdminSignal(signal: { tradingsymbol: string; action: string; price: number; stopLoss: number; target: number; exchange: string; baseQty: number }, token: string) {
    const res = await fetch(`${BASE_URL}/admin/signal`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(signal),
    });
    return res.json();
  },

  async getLiveTrades(symbol: string) {
    const res = await fetch(`${BASE_URL}/api/trades/live?symbol=${symbol}`);
    if (!res.ok) throw new Error("Failed to fetch live trades");
    return res.json();
  },

  async getTradeHistory(symbol: string, timeframe: string = "1") {
    const res = await fetch(`${BASE_URL}/api/trades/history?symbol=${symbol}&timeframe=${timeframe}`);
    if (!res.ok) throw new Error("Failed to fetch trade history");
    return res.json();
  },

  async getCurrentSignals(symbol?: string) {
    const url = symbol ? `${BASE_URL}/api/signals/current?symbol=${symbol}` : `${BASE_URL}/api/signals/current`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch signals");
    return res.json();
  },

  async getOpenPositions() {
    const res = await fetch(`${BASE_URL}/api/positions/open`);
    if (!res.ok) throw new Error("Failed to fetch open positions");
    return res.json();
  },

  async getDashboardPositions() {
    const res = await fetch(`${BASE_URL}/api/dashboard/positions`);
    if (!res.ok) throw new Error("Failed to fetch dashboard positions");
    return res.json();
  },

  async getDashboardHistory() {
    const res = await fetch(`${BASE_URL}/api/dashboard/history`);
    if (!res.ok) throw new Error("Failed to fetch dashboard history");
    return res.json();
  },

  async getDashboardOrders() {
    const res = await fetch(`${BASE_URL}/api/dashboard/orders`);
    if (!res.ok) throw new Error("Failed to fetch dashboard orders");
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  }
};
