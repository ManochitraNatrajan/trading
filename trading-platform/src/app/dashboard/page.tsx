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

  const [activeSymbol, setActiveSymbol] = useState("NATGASMINI1");
  const [autoTradeOn, setAutoTradeOn] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState<{username: string, password: string} | null>(null);
  
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  
  const [brokerUsernameInput, setBrokerUsernameInput] = useState("");
  const [brokerPasswordInput, setBrokerPasswordInput] = useState("");
  const [stats, setStats] = useState<any>(null);
  
  const [balance, setBalance] = useState(0);
  const [strategyProfit, setStrategyProfit] = useState(0);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  const handleTradeComplete = (tradeDetails: any) => {
    setTradeHistory((prev) => [tradeDetails, ...prev]);
    setStrategyProfit(tradeDetails.pnl);
  };

  const fetchBalance = async () => {
    try {
      // Mock goodwill api response
      const res = { availableBalance: 1000 };
      setBalance(res.availableBalance);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (brokerDetails) {
      fetchBalance();
    }
  }, [brokerDetails]);

  useEffect(() => {
    if (strategyProfit !== 0) {
      setBalance((prev) => prev + strategyProfit);
      // Reset profit delta after adding so it doesn't re-add repeatedly if component re-renders
      setStrategyProfit(0);
    }
  }, [strategyProfit]);

  useEffect(() => {
    const saved = localStorage.getItem("prathik_broker_goodwill");
    if (saved) {
      setTimeout(() => setBrokerDetails(JSON.parse(saved)), 0);
    }
  }, []);

  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccepted) {
      alert("Terms & Conditions accept panna dhaan login panna mudiyum!");
      setIsTermsModalOpen(true);
      return;
    }
    const creds = { username: brokerUsernameInput, password: brokerPasswordInput };
    setBrokerDetails(creds);
    localStorage.setItem("prathik_broker_goodwill", JSON.stringify(creds));
    setIsConnectModalOpen(false);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user && !brokerDetails && !isAccepted) {
      setIsTermsModalOpen(true);
    }
  }, [user, isLoading, router, brokerDetails, isAccepted]);

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
    <>
      {brokerDetails && (
        <div className="w-[320px] fixed left-0 top-0 h-full bg-[#35353d] border-r border-zinc-800 text-white p-4 z-50 flex flex-col shadow-2xl">
          <div className="text-center py-4 border-b border-zinc-600/50 mb-4">
              <span className="text-lg font-black tracking-widest text-[#10b981]">🏆 PRATHIK ALGO LAB 🏆</span>
          </div>
          <div className="flex flex-col gap-4 text-sm font-semibold flex-1 mt-4">
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">STRATEGY NAME:</span> <span className="text-white text-right">Prathik Elite Scalper</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">LICENSE STATUS:</span> <span className="text-[#10b981]">✅ ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">CONTACT NUMBER:</span> <span className="text-zinc-100">+91 9042701119</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">BOOKED P/L:</span> <span className="text-blue-400">₹{stats?.balance ? (stats.balance * 0.05).toFixed(2) : '3,250.00'}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">RUNNING P/L:</span> <span className="text-blue-400 font-black animate-pulse">₹+850.50</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/30 p-3 rounded border border-zinc-700/50">
                  <span className="text-zinc-400">WIN RATE:</span> <span className="text-zinc-100">45.17%</span>
              </div>
          </div>
          <div className="mt-auto">
              <div className="bg-[#10b981] px-3 py-3 text-center rounded mb-2 shadow-lg">
                  <span className="text-xs font-black text-white tracking-widest">KADAN ILLA THALAIMURAI SEIVOM</span>
              </div>
              <div className="bg-zinc-900/80 px-3 py-2 text-center rounded border border-red-900/30">
                  <span className="text-[10px] text-zinc-400 tracking-tighter block leading-relaxed">⚠️ Disclaimer: Trading involves significant risk. We are not SEBI Registered Advisors. Self-execution only.</span>
              </div>
          </div>
        </div>
      )}
      <div className={`h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col overflow-hidden transition-all duration-300 ${brokerDetails ? 'ml-[320px] w-[calc(100vw-320px)]' : 'w-screen'}`}>
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
                onClick={() => {
                  if (!brokerDetails) {
                    if (!isAccepted) setIsTermsModalOpen(true);
                    else setIsConnectModalOpen(true);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-widest ${brokerDetails ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500' : 'bg-red-900/20 border-red-500/30 text-red-500 hover:bg-red-900/40'}`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${brokerDetails ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                {brokerDetails ? 'Broker Connected' : 'Connect Broker'}
            </button>

            {/* Balance */}
            <div className="flex flex-col items-end px-2">
                {brokerDetails ? (
                   <div className="text-lg font-semibold text-green-400">
                     Available Balance: ₹{balance}
                   </div>
                ) : (
                   <div className="text-sm font-semibold text-zinc-500 mt-1">
                     No Amount
                   </div>
                )}
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
            <BottomPanel localTradeHistory={tradeHistory} />
        </div>

        {/* Right Side: Order Entry Panel */}
        <OrderPanel symbol={activeSymbol} onSymbolChange={setActiveSymbol} onTradeComplete={handleTradeComplete} />
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

      {/* SEBI TERMS MODAL */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-lg rounded p-6 relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-white mb-2">Terms & Conditions</h2>
            <p className="text-sm text-yellow-500 mb-4 font-bold bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
              SEBI Mandatory Disclosure. Please read completely and accept to continue.
            </p>
            
            <div 
              className="overflow-y-auto bg-[#111] border border-zinc-800 rounded p-4 text-sm text-zinc-300 space-y-4 mb-6 flex-1 min-h-[50vh] scrollbar-thin scrollbar-thumb-zinc-700"
              onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5) {
                  setHasScrolledToBottom(true);
                }
              }}
            >
              <div>
                <h3 className="font-bold text-white mb-1">1. Non-Advisory Nature:</h3>
                <p>Prathik Algo Lab is a technology platform, NOT a SEBI Registered Investment Advisor (RIA) or Research Analyst (RA).</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">2. Self-Execution:</h3>
                <p>User confirms they are using their own Broker API (Goodwill) and all trades are executed under their sole discretion.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">3. Risk Disclosure:</h3>
                <p>Commodity trading (Natural Gas Mini) involves high risk. Past performance of the 'Prathik Elite Scalper' is not a guarantee of future results.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">4. No Profit Sharing:</h3>
                <p>User confirms no profit-sharing or management fee is paid to the platform provider.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">5. 10 OPS Limit:</h3>
                <p>User agrees not to modify the code to exceed 10 orders per second to comply with SEBI retail algo guidelines.</p>
              </div>
              <div className="h-4"></div>
            </div>

            <button 
              disabled={!hasScrolledToBottom}
              onClick={() => {
                setIsAccepted(true);
                setIsTermsModalOpen(false);
                setIsConnectModalOpen(true);
              }}
              className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded transition-colors ${
                hasScrolledToBottom
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {hasScrolledToBottom ? "Accept & Continue" : "Scroll to Bottom to Accept"}
            </button>
            <button 
              onClick={() => setIsTermsModalOpen(false)}
              className="mt-4 w-full py-2 font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
