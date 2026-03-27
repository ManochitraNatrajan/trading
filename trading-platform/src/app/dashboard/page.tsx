"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LiveCandles from "@/components/LiveCandles";

export default function DashboardPage() {
  const { user, isLoading, updateBalance } = useAuth();
  const router = useRouter();

  const [trades, setTrades] = useState([
    { pair: "CRUDEOIL", action: "BUY", price: 6410.50, time: "2m ago", profit: 0 },
    { pair: "BANKNIFTY", action: "SELL", price: 48500.20, time: "15m ago", profit: 1250.4 },
    { pair: "RELIANCE", action: "BUY", price: 2950.00, time: "1h ago", profit: -450.2 },
  ]);
  const [autoTradeOn, setAutoTradeOn] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState<{username: string, password: string} | null>(null);
  
  const [brokerUsernameInput, setBrokerUsernameInput] = useState("");
  const [brokerPasswordInput, setBrokerPasswordInput] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editPasswordInput, setEditPasswordInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("prathik_broker_goodwill");
    if (saved) {
      setBrokerDetails(JSON.parse(saved));
    }
  }, []);

  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = { username: brokerUsernameInput, password: brokerPasswordInput };
    setBrokerDetails(creds);
    localStorage.setItem("prathik_broker_goodwill", JSON.stringify(creds));
    setIsConnectModalOpen(false);
  };

  const handleDisconnectBroker = () => {
    setBrokerDetails(null);
    localStorage.removeItem("prathik_broker_goodwill");
    setIsManageModalOpen(false);
    setIsEditingPassword(false);
  };

  const handleSavePassword = () => {
    if (brokerDetails) {
      const updated = { ...brokerDetails, password: editPasswordInput };
      setBrokerDetails(updated);
      localStorage.setItem("prathik_broker_goodwill", JSON.stringify(updated));
      setIsEditingPassword(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Simulated Trading Engine
  useEffect(() => {
    if (!user) return;
    
    // If premium, simulate active live trading every 4 seconds
    // If trial, simulate slow demo trading every 8 seconds
    const intervalTime = user.status === "premium" ? 4000 : 8000;

    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.5;
      const pairs = ["BANKNIFTY", "NIFTY50", "RELIANCE", "HDFCBANK", "CRUDEOIL", "GOLD", "SILVER"];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      
      const basePrice = pair === "BANKNIFTY" ? 48000 : pair === "NIFTY50" ? 22000 : pair === "RELIANCE" ? 2900 : pair === "CRUDEOIL" ? 6400 : pair === "GOLD" ? 63000 : pair === "SILVER" ? 75000 : 1400;
      const price = basePrice + (Math.random() * basePrice * 0.01 * (Math.random() > 0.5 ? 1 : -1));
      
      const profit = user.status === "premium" ? (Math.random() * 5000 * (Math.random() > 0.3 ? 1 : -1)) : 0; // Trial doesn't accrue real profit in this demo

      setTrades(prev => [
        { pair, action: isBuy ? "BUY" : "SELL", price, time: "Just now", profit },
        ...prev.slice(0, 4)
      ]);

      if (user.status === "premium" && profit !== 0) {
        updateBalance(user.balance + profit);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [user, updateBalance]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTrial = user.status === "trial";
  const daysLeft = Math.ceil((user.trialExpiresAt - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono pb-20">
      
      {isTrial && (
        <div className="bg-emerald-900/40 border-b border-emerald-500/20 px-6 py-3 font-sans flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-100">
              Demo Trial Active ({daysLeft} days remaining) — Trades are simulated.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-sans">
              {isTrial ? "Auto Trading Simulation" : "Live Execution Terminal"}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
              Welcome back, <span className="text-emerald-500 font-medium">{user.name}</span>
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Auto Trading Toggle */}
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-zinc-400 text-sm font-medium">Auto-Trading</span>
              <button 
                onClick={() => setAutoTradeOn(!autoTradeOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoTradeOn ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoTradeOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-zinc-500 text-sm block mb-1">Total Balance</span> 
              <span className="text-xl font-medium tracking-tight">
                ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
              <span className="text-zinc-500 text-sm block mb-1">Status</span> 
              <span className={`text-sm font-bold uppercase tracking-wider ${isTrial ? 'text-amber-500' : 'text-emerald-500'}`}>
                {isTrial ? 'DEMO MODE' : 'LIVE TRADING'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 h-[500px] bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Algorithmic Order Flow</h3>
              <div className="text-2xl flex items-center gap-3">
                ₹48,230.12 <span className="text-sm text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+1.24%</span>
              </div>
            </div>
            <div className="absolute inset-0 z-0">
               <LiveCandles />
            </div>
            
            {isTrial && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="text-center p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl max-w-sm">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-sans font-medium text-white mb-2">Demo Mode Active</h3>
                  <p className="text-sm text-zinc-400 font-sans mb-6">
                    You are viewing a delayed simulation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6 flex flex-col h-[500px]">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 flex flex-col flex-1 overflow-hidden">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 font-sans">Live Execution Log</h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {trades.map((trade, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${trade.action === "BUY" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                          {trade.action}
                        </span>
                        <span className="text-zinc-300 font-medium">{trade.pair}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{trade.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-zinc-100">
                        ₹{trade.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {!isTrial && trade.profit !== 0 && (
                        <div className={`text-xs mt-0.5 ${trade.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/20 rounded-2xl p-5 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-500 font-sans font-medium">Auto Trading Engine</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {isTrial 
                  ? "Demonstration algorithms are currently generating phantom trades against historic order books."
                  : "High-frequency algorithms are connected and actively managing your portfolio based on live market conditions."}
              </p>
            </div>
          </div>
        </div>

        {/* Broker Integrations Section */}
        <div className="mt-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 to-transparent pointer-events-none" />
          <h2 className="text-lg font-semibold tracking-tight font-sans mb-1 text-white">Broker Connections</h2>
          <p className="text-sm text-zinc-400 mb-6 font-sans">
            Securely link your personal Demat accounts via API so the AI can execute Buy/Sell signals automatically using your funds.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Goodwill Integration Card */}
            {brokerDetails ? (
              <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center font-bold text-emerald-400 border border-emerald-900 shadow-inner">
                    G
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-wide">Goodwill Wealth Management</div>
                    <div className="text-xs text-emerald-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      API Connected ({brokerDetails.username})
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsManageModalOpen(true)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer relative z-10 shrink-0"
                >
                  Manage
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-black/60 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center font-bold text-blue-400 border border-blue-900 shadow-inner">
                    G
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-wide">Goodwill Wealth Management</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                      API Not Connected
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-blue-600/10 text-blue-500 border border-blue-600/30 rounded-lg hover:bg-blue-600 hover:text-white transition-colors cursor-pointer relative z-10 shrink-0"
                >
                  Connect
                </button>
              </div>
            )}

            {/* Angel One Integration Card (Locked) */}
            <div className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-orange-500 border border-orange-900/50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-400 tracking-wide">Angel One</div>
                  <div className="text-xs text-zinc-600 mt-0.5">Currently Under Maintenance</div>
                </div>
              </div>
              <button disabled className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-lg cursor-not-allowed">
                Locked
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Connect Broker Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsConnectModalOpen(false)} />
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-1">Connect Goodwill API</h2>
            <p className="text-sm text-zinc-500 mb-6">Enter your broker credentials to grant execution access.</p>
            
            <form onSubmit={handleConnectBroker} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Client ID</label>
                <input type="text" required value={brokerUsernameInput} onChange={e => setBrokerUsernameInput(e.target.value.toUpperCase())} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="e.g. GWCN1737" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Password</label>
                <input type="password" required value={brokerPasswordInput} onChange={e => setBrokerPasswordInput(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                Link Broker
              </button>
            </form>
            
            <button onClick={() => setIsConnectModalOpen(false)} className="w-full py-3 bg-transparent text-zinc-500 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-900 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Broker Management Modal */}
      {isManageModalOpen && brokerDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsManageModalOpen(false); setIsEditingPassword(false); }} />
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-1">Manage Connection</h2>
            <p className="text-sm text-zinc-500 mb-6">Goodwill Wealth Management (ID: {brokerDetails.username})</p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800/50">
                  <span className="text-sm font-medium text-zinc-400">API Status</span>
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Actively Syncing
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Latency & Slippage</span>
                  <span className="text-emerald-400 font-mono">14ms ping (Optimal)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Broker Password</label>
                <div className="flex gap-2">
                  <input 
                    type={isEditingPassword ? "text" : "password"} 
                    value={isEditingPassword ? editPasswordInput : brokerDetails.password} 
                    onChange={e => setEditPasswordInput(e.target.value)}
                    readOnly={!isEditingPassword} 
                    className={`w-full bg-black border ${isEditingPassword ? 'border-amber-500 text-white' : 'border-zinc-800 text-zinc-500'} rounded-xl px-4 py-3 focus:outline-none transition-colors`} 
                  />
                  {isEditingPassword ? (
                    <button onClick={handleSavePassword} className="px-5 bg-amber-500 text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-amber-400 transition-colors shrink-0">Save</button>
                  ) : (
                    <button onClick={() => { setIsEditingPassword(true); setEditPasswordInput(brokerDetails.password); }} className="px-5 bg-zinc-800 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-700 transition-colors shrink-0">Edit</button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/30 rounded-xl mt-4">
                <div>
                  <h4 className="text-sm font-bold text-red-500">Revoke Access</h4>
                  <p className="text-xs text-red-500/60 mt-0.5">Halt AI signal execution instantly</p>
                </div>
                <button onClick={handleDisconnectBroker} className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-red-500/20 hover:bg-red-600 hover:text-white transition-colors shrink-0">
                  Disconnect
                </button>
              </div>
            </div>
            
            <button onClick={() => { setIsManageModalOpen(false); setIsEditingPassword(false); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-200 transition-colors">
              Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
