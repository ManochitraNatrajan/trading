"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [symbol, setSymbol] = useState("BANKNIFTY");
  const [action, setAction] = useState("BUY");
  const [exchange, setExchange] = useState("MCX");
  const [price, setPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [qty, setQty] = useState("1");
  const [status, setStatus] = useState({ loading: false, message: "" });

  const handleSendSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, message: "Transmitting Signal to Engine..." });

    try {
      // Fetch admin token from local storage (mocked for demo)
      const mockAdminToken = "admin_super_secret_jwt";
      
      const payload = {
        tradingsymbol: symbol,
        action,
        price: parseFloat(price),
        stopLoss: parseFloat(stopLoss),
        target: parseFloat(target),
        exchange: exchange,
        baseQty: parseFloat(qty)
      };

      // Real integration: Replace with actual token
      const res = await api.sendAdminSignal(payload, mockAdminToken);
      
      if (res.success) {
        setStatus({ loading: false, message: `Signal Executed for ${res.executedFor} users concurrently.` });
      } else {
        setStatus({ loading: false, message: `Failed: ${res.error || "Unknown error"}` });
      }

      // Clear after 4 seconds
      setTimeout(() => setStatus({ loading: false, message: "" }), 4000);
      
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, message: "Network error communicating with the backend API." });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2 text-red-500">Master Admin Terminal</h1>
          <p className="text-zinc-400">Dispatch trade signals directly to connected broker APIs representing thousands of retail accounts.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Signal Dispatch Form */}
          <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <h2 className="text-xl font-medium mb-6">Create New Signal</h2>
            
            <form onSubmit={handleSendSignal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Trading Symbol</label>
                  <input required value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-white font-mono" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Action</label>
                  <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-white font-bold tracking-wider">
                    <option value="BUY" className="text-emerald-500">BUY</option>
                    <option value="SELL" className="text-red-500">SELL</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Exchange</label>
                  <select value={exchange} onChange={(e) => setExchange(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-white font-bold tracking-wider">
                    <option value="MCX">MCX</option>
                    <option value="NFO">NFO</option>
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Exec. Price</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-white font-mono" placeholder="Market or Limit" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Base Quantity</label>
                  <input type="number" required value={qty} onChange={(e) => setQty(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-white font-mono" placeholder="Lot size" />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Stop Loss</label>
                  <input type="number" required value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-red-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Target Price</label>
                  <input type="number" required value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-2 text-emerald-400 font-mono" />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={status.loading}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm text-black transition-all bg-red-500 hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50"
                >
                  {status.loading ? "Broadcasting..." : "Execute Global Signal"}
                </button>
              </div>

              {status.message && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                  {status.message}
                </div>
              )}
            </form>
          </div>

          {/* Connected Broker Clients Stats */}
          <div className="space-y-6">
            <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
              <h3 className="text-zinc-400 text-sm mb-1 uppercase tracking-widest">Active Brokers Connected</h3>
              <div className="text-4xl font-light text-emerald-400">14,230</div>
              <p className="text-xs text-emerald-500/50 mt-2">Ready to receive signals via WebSockets</p>
            </div>

            <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <h3 className="text-zinc-400 text-sm mb-4 uppercase tracking-widest">Recent Dispatches</h3>
              <div className="space-y-3">
                {[
                  { sym: "NIFTY50", act: "BUY", time: "10m ago", res: "14,200 Executed" },
                  { sym: "BANKNIFTY", act: "SELL", time: "1h ago", res: "13,950 Executed" },
                  { sym: "RELIANCE", act: "BUY", time: "3h ago", res: "12,120 Executed" }
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-800/50 pb-2 text-sm">
                    <div>
                      <span className={`font-bold mr-2 ${d.act === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>{d.act}</span>
                      <span className="text-zinc-200">{d.sym}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-xs">{d.time}</div>
                      <div className="text-zinc-400 text-xs">{d.res}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
