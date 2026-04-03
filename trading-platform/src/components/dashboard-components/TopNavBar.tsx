"use client";

import { useAuth } from "@/lib/AuthContext";
import { Bell, Wifi, WifiOff, Settings, Wallet, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TopNavBar() {
  const { user } = useAuth();
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("prathik_broker_goodwill");
    setBrokerConnected(!!saved);

    api.getDashboardStats()
       .then(data => setStats(data.stats))
       .catch(() => {});
  }, []);
  
  if (!user) return null;

  return (
    <div className="h-14 border-b border-zinc-800 bg-[#0f1115] flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center text-zinc-400 gap-2 font-semibold">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Symbols..." 
            className="bg-transparent border-none outline-none text-sm w-48 text-zinc-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* P/L & Balance */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-zinc-500">Available Balance</span>
            <span className="font-mono text-zinc-200">
              {brokerConnected ? `₹${stats?.balance?.toLocaleString('en-IN') || user.balance?.toLocaleString('en-IN') || "0.00"}` : "No Amount"}
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-500">Today P/L</span>
            <span className="font-mono text-emerald-500">+₹4,850.50</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2 ${brokerConnected ? 'text-emerald-500' : 'text-red-500'}`}>
            {brokerConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="text-[10px] whitespace-nowrap font-medium uppercase tracking-wider">
              {brokerConnected ? "Broker Live" : "Not Connected"}
            </span>
          </div>
          <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Market Open</span>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                {user.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
