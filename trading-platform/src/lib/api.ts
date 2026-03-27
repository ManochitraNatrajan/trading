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
  }
};
