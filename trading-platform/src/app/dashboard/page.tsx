"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import TradingChart from "@/components/TradingChart";
import OrderPanel from "@/components/OrderPanel";
import BottomPanel from "@/components/BottomPanel";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeSymbol, setActiveSymbol] = useState("BANKNIFTY");
  const [autoTradeOn, setAutoTradeOn] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState<{username: string, password: string} | null>(null);
  
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [brokerUsernameInput, setBrokerUsernameInput] = useState("");
  const [brokerPasswordInput, setBrokerPasswordInput] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("prathik_broker_goodwill");
    if (saved) {
      setTimeout(() => setBrokerDetails(JSON.parse(saved)), 0);
    }
  }, []);

  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = { username: brokerUsernameInput, password: brokerPasswordInput };
    setBrokerDetails(creds);
    localStorage.setItem("prathik_broker_goodwill", JSON.stringify(creds));
    setIsConnectModalOpen(false);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      api.getDashboardStats()
         .then(data => setStats(data.stats))
         .catch(() => {});
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-100 font-sans flex flex-col overflow-hidden">
      {/* Top Navbar / Header */}
      <div className="h-14 bg-[#0a0a0a] border-b border-zinc-800 shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white flex items-center justify-center"
                title="Go Back"
            >
                <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="text-emerald-500 font-bold tracking-tight bg-emerald-500/10 px-3 py-1 rounded">
                Prathik Algo Lab
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <h1 className="text-sm font-semibold text-zinc-300">Live Advanced Terminal</h1>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Auto Trading Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Auto Trading</span>
                <button 
                  onClick={() => setAutoTradeOn(!autoTradeOn)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoTradeOn ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoTradeOn ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Broker Status */}
            <button 
                onClick={() => !brokerDetails && setIsConnectModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-widest ${brokerDetails ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500' : 'bg-red-900/20 border-red-500/30 text-red-500 hover:bg-red-900/40'}`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${brokerDetails ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                {brokerDetails ? 'Broker Connected' : 'Connect Broker'}
            </button>

            {/* Balance */}
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Balance</span>
                <span className="text-sm font-black text-white px-2">
                  {brokerDetails 
                    ? (stats?.balance ? `₹${stats.balance.toLocaleString('en-IN')}` : `₹${user.balance.toLocaleString('en-IN')}`) 
                    : "No Amount"}
                </span>
            </div>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Charting */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
            <div className="flex-1 min-h-0 relative">
                <TradingChart symbol={activeSymbol} />
            </div>
            
            {/* Bottom Panel */}
            <BottomPanel />
        </div>

        {/* Right Side: Order Entry Panel */}
        <OrderPanel symbol={activeSymbol} onSymbolChange={setActiveSymbol} />
      </div>

      {/* Connect Broker Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsConnectModalOpen(false)} />
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-md rounded p-6 relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Connect API Broker</h2>
            <p className="text-sm text-zinc-500 mb-6">Enter API credentials to grant live execution access.</p>
            
            <form onSubmit={handleConnectBroker} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Broker</label>
                <select className="w-full bg-[#111] border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none">
                    <option>Goodwill</option>
                    <option>Zerodha Kite</option>
                    <option>Angel One</option>
                    <option>Upstox</option>
                    <option>Fyers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">API Key / Client ID</label>
                <input type="text" required value={brokerUsernameInput} onChange={e => setBrokerUsernameInput(e.target.value.toUpperCase())} className="w-full bg-[#111] border border-zinc-800 rounded px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">API Secret / Password</label>
                <input type="password" required value={brokerPasswordInput} onChange={e => setBrokerPasswordInput(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded hover:bg-blue-500 transition-colors">
                Connect API
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
