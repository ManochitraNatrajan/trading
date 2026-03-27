"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function SignalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mocked Historic Execution Logs
  const executionLogs = [
    { id: 1, pair: "BANKNIFTY", action: "BUY", entry: 48100.5, exit: 48500.2, time: "Today, 14:30", profit: 5995.5 },
    { id: 2, pair: "CRUDEOIL", action: "SELL", entry: 6450.0, exit: 6410.5, time: "Today, 11:15", profit: 3950.0 },
    { id: 3, pair: "NIFTY50", action: "BUY", entry: 22100.0, exit: 22050.0, time: "Yesterday, 15:00", profit: -2500.0 },
    { id: 4, pair: "RELIANCE", action: "BUY", entry: 2920.0, exit: 2950.0, time: "Yesterday, 10:45", profit: 1500.0 },
    { id: 5, pair: "HDFCBANK", action: "SELL", entry: 1440.0, exit: 1410.0, time: "Mar 24, 13:20", profit: 4500.0 },
    { id: 6, pair: "GOLD", action: "BUY", entry: 63000.0, exit: 63500.0, time: "Mar 24, 09:15", profit: 50000.0 },
    { id: 7, pair: "SILVER", action: "SELL", entry: 75500.0, exit: 74000.0, time: "Mar 23, 14:10", profit: 45000.0 },
    { id: 8, pair: "BANKNIFTY", action: "BUY", entry: 47800.0, exit: 47950.0, time: "Mar 22, 11:00", profit: 2250.0 },
  ];

  const isTrial = user.status === "trial";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans pb-20">
      
      {isTrial && (
        <div className="bg-emerald-900/40 border-b border-emerald-500/20 px-6 py-3 font-sans flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-100">
              Demo Trial Active — Viewing simulated historical performance.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Past Performance Archive</h1>
            <p className="text-zinc-400 text-sm">Comprehensive ledger of trades executed by the algorithmic engine.</p>
          </div>
          
          <Link href="/dashboard" className="px-5 py-3 text-sm font-bold tracking-widest uppercase bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/50 hover:bg-zinc-800 transition-all text-white">
            Return to Dashboard
          </Link>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800/80">
            <h2 className="text-xl font-bold tracking-tight text-white hidden sm:block">Execution Ledger</h2>
            <div className="flex gap-4 items-center">
               <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total P&L Tracked:</span>
               <span className="text-lg font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded shadow-inner border border-emerald-400/20">₹1,10,695.50</span>
            </div>
          </div>

          <div className="space-y-4">
            {executionLogs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 bg-black/60 border border-zinc-800/80 rounded-xl hover:bg-zinc-900/50 hover:border-zinc-700 transition-colors gap-4 sm:gap-0">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-12 shrink-0">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${log.action === "BUY" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                      {log.action}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white tracking-wide mb-1 text-lg">{log.pair}</div>
                    <div className="text-xs text-zinc-500 font-mono">{log.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 sm:gap-12 text-left sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t border-zinc-800/50 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="hidden md:block">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Entry Price</div>
                    <div className="text-zinc-300 font-mono text-sm">₹{log.entry.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Exit Price</div>
                    <div className="text-zinc-300 font-mono text-sm">₹{log.exit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="min-w-[100px] text-right">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Net Flow</div>
                    <div className={`font-mono font-bold text-lg ${log.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.profit > 0 ? '+' : ''}₹{log.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex justify-center">
             <button className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors cursor-not-allowed">
               End of Historical Logs
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
