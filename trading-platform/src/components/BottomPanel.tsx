"use client";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export default function BottomPanel({ localTradeHistory = [] }: { localTradeHistory?: any[] }) {
    const [activeTab, setActiveTab] = useState("Positions");
    const [positions, setPositions] = useState<any[]>([]);
    const [tradeHistory, setTradeHistory] = useState<any[]>([]);
    const [orderHistory, setOrderHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalProfit: 0, winRate: 0, totalTrades: 0 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        if (activeTab === "Positions") {
            api.getDashboardPositions()
                .then(data => setPositions(Array.isArray(data) ? data : data.positions || []))
                .catch(() => setPositions([]))
                .finally(() => setIsLoading(false));
        } else if (activeTab === "Trade History") {
            api.getDashboardHistory() 
                .then(data => setTradeHistory(Array.isArray(data) ? data : data.history || []))
                .catch(() => setTradeHistory([]))
                .finally(() => setIsLoading(false));
        } else if (activeTab === "Order History") {
            api.getDashboardOrders() 
                .then(data => setOrderHistory(Array.isArray(data) ? data : data.orders || []))
                .catch(() => setOrderHistory([]))
                .finally(() => setIsLoading(false));
        } else if (activeTab === "P&L Report") {
            api.getDashboardStats()
                .then(data => setStats(data.stats || { totalProfit: 0, winRate: 0, totalTrades: 0 }))
                .catch(() => {})
                .finally(() => setIsLoading(false));
        } else {
             setIsLoading(false);
        }
    }, [activeTab]);

    const tabs = ["Positions", "Trade History", "Order History", "P&L Report"];

    return (
        <div className="flex flex-col h-[280px] bg-[#050505] border-t border-zinc-800 shrink-0 select-none">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-[#0a0a0a]">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? "text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900/50" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        {tab} {tab === "Positions" && `(${positions.length})`}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-0">
                {activeTab === "Positions" && (
                    <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-[#111] text-zinc-500 border-b border-zinc-800 sticky top-0">
                            <tr>
                                <th className="p-3 font-medium">Symbol</th>
                                <th className="p-3 font-medium">Qty</th>
                                <th className="p-3 font-medium">Avg Price</th>
                                <th className="p-3 font-medium">LTP</th>
                                <th className="p-3 font-medium text-right">P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {positions.length > 0 ? positions.map((pos, i) => (
                                <tr key={i} className="hover:bg-zinc-900/50 text-zinc-300">
                                    <td className="p-3 font-semibold">
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${pos.buySell === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {pos.symbol}
                                    </td>
                                    <td className="p-3">{pos.quantity}</td>
                                    <td className="p-3">₹{pos.entryPrice}</td>
                                    <td className="p-3 text-white font-mono animate-pulse">₹{(pos.entryPrice * 1.002).toFixed(2)}</td>
                                    <td className={`p-3 text-right font-medium ${Math.random() > 0.5 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {Math.random() > 0.5 ? '+' : '-'}₹{(Math.random() * 500).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-600 font-medium">
                                        No open positions. 
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === "Trade History" && (
                    <div className="p-4 space-y-2 font-mono text-xs text-zinc-300 h-full overflow-auto custom-scrollbar">
                        {localTradeHistory.length === 0 ? (
                            <div className="text-zinc-500 text-center mt-4">No trade history</div>
                        ) : localTradeHistory.map((t: any, i: number) => (
                          <div key={i} className="bg-zinc-900/50 p-3 rounded border border-zinc-800 shadow flex flex-wrap gap-2 items-center">
                            <span className={`font-black ${t.type === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>{t.type}</span> 
                            <span className="text-zinc-500">|</span> <span className="text-zinc-400">Entry:</span> <span className="text-white">{t.entry}</span> 
                            <span className="text-zinc-500">|</span> <span className="text-zinc-400">Exit:</span> <span className="text-white">{t.exit}</span> 
                            <span className="text-zinc-500">|</span> <span className="text-zinc-400">Qty:</span> <span className="text-white">{t.qty}</span> 
                            <span className="text-zinc-500">|</span> <span className="text-zinc-400">P/L:</span> <span className={`font-bold ${t.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>₹{t.pnl}</span> 
                            <span className="text-zinc-500">|</span> <span className="text-zinc-500 text-[10px]">{t.time}</span>
                          </div>
                        ))}
                    </div>
                )}

                {activeTab === "Order History" && (
                    <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-[#111] text-zinc-500 border-b border-zinc-800 sticky top-0">
                            <tr>
                                <th className="p-3 font-medium">Time</th>
                                <th className="p-3 font-medium">Symbol</th>
                                <th className="p-3 font-medium">Type</th>
                                <th className="p-3 font-medium">Action</th>
                                <th className="p-3 font-medium">Qty</th>
                                <th className="p-3 font-medium">Price</th>
                                <th className="p-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-zinc-600">Loading Order History...</td></tr>
                            ) : orderHistory.length > 0 ? orderHistory.map((order, i) => (
                                <tr key={i} className="hover:bg-zinc-900/50 text-zinc-300">
                                    <td className="p-3 font-mono">{new Date(order.createdAt || Date.now()).toLocaleString()}</td>
                                    <td className="p-3 font-semibold">{order.symbol}</td>
                                    <td className="p-3">{order.orderType || "MARKET"}</td>
                                    <td className={`p-3 font-bold ${order.action === "BUY" ? "text-emerald-500" : "text-red-500"}`}>
                                        {order.action}
                                    </td>
                                    <td className="p-3">{order.quantity || "-"}</td>
                                    <td className="p-3 font-mono border-r border-zinc-800/50">₹{order.price || order.entryPrice || 0}</td>
                                    <td className={`p-3 font-semibold ${order.status === 'REJECTED' || order.status === 'CANCELLED' ? 'text-red-500' : 'text-emerald-500'}`}>{order.status}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-600 font-medium">
                                        No order history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === "P&L Report" && (
                    <div className="flex items-center justify-around h-full">
                        <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                            <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Profit</span>
                            <span className={`text-2xl font-black ${stats.totalProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {stats.totalProfit >= 0 ? "+" : "-"}₹{Math.abs(stats.totalProfit).toFixed(2)}
                            </span>
                        </div>
                        <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                            <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Win Rate</span>
                            <span className="text-2xl font-black text-white">{stats.winRate}%</span>
                        </div>
                        <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                            <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Trades</span>
                            <span className="text-2xl font-black text-white">{stats.totalTrades}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
