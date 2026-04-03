"use client";
import { useState } from "react";

interface OrderPanelProps {
    symbol: string;
    onSymbolChange: (s: string) => void;
}

export default function OrderPanel({ symbol, onSymbolChange }: OrderPanelProps) {
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [orderType, setOrderType] = useState<"Market" | "Limit" | "StopLimit">("Market");
    const [qty, setQty] = useState<number>(15);
    const [stopLoss, setStopLoss] = useState<string>("");
    const [target, setTarget] = useState<string>("");
    const [price, setPrice] = useState<string>("");

    const handlePlaceOrder = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/dashboard/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    action,
                    quantity: qty,
                    orderType,
                    price: price || null,
                    stopLoss: stopLoss || null,
                    target: target || null,
                })
            });
            if (res.ok) {
                alert(`${action} Order Placed for ${qty} ${symbol}`);
            }
        } catch (e) {
            console.error("Order Failed", e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-zinc-900 w-[320px] shrink-0 p-4 font-sans text-sm">
            <h3 className="text-zinc-100 font-semibold text-base mb-4 tracking-tight">Order Execution</h3>
            
            <div className="mb-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Symbol</label>
                <select 
                    value={symbol}
                    onChange={(e) => onSymbolChange(e.target.value)}
                    className="w-full bg-[#111] border border-zinc-800 text-white p-2 rounded focus:outline-none focus:border-emerald-500"
                >
                    <option value="BANKNIFTY">BANKNIFTY</option>
                    <option value="NIFTY50">NIFTY50</option>
                    <option value="RELIANCE">RELIANCE</option>
                    <option value="HDFCBANK">HDFCBANK</option>
                    <option value="CRUDEOIL">CRUDEOIL</option>
                </select>
            </div>

            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => setAction("BUY")}
                    className={`flex-1 py-2 font-bold rounded ${action === "BUY" ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                    BUY
                </button>
                <button 
                    onClick={() => setAction("SELL")}
                    className={`flex-1 py-2 font-bold rounded ${action === "SELL" ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                >
                    SELL
                </button>
            </div>

            <div className="flex bg-[#111] rounded p-1 mb-4 border border-zinc-800">
                {["Market", "Limit", "StopLimit"].map((t) => (
                    <button 
                        key={t}
                        onClick={() => setOrderType(t as any)}
                        className={`flex-1 text-xs py-1.5 rounded ${orderType === t ? "bg-zinc-800 text-white shadow" : "text-zinc-500"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="space-y-3 mb-6">
                <div>
                    <label className="text-xs text-zinc-500 block mb-1">Quantity</label>
                    <div className="flex">
                        <button onClick={() => setQty(Math.max(1, qty - 15))} className="bg-zinc-800 px-3 text-white rounded-l border border-zinc-700">-</button>
                        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full bg-[#111] border-y border-zinc-700 text-center text-white focus:outline-none" />
                        <button onClick={() => setQty(qty + 15)} className="bg-zinc-800 px-3 text-white rounded-r border border-zinc-700">+</button>
                    </div>
                </div>

                {orderType !== "Market" && (
                    <div>
                        <label className="text-xs text-zinc-500 block mb-1">Price</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-[#111] border border-zinc-800 text-white p-2 rounded focus:outline-none" />
                    </div>
                )}

                <div>
                    <label className="text-xs text-zinc-500 block mb-1">Stop Loss</label>
                    <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="0.00" className="w-full bg-[#111] border border-zinc-800 text-emerald-500 p-2 rounded focus:outline-none" />
                </div>
                <div>
                    <label className="text-xs text-zinc-500 block mb-1">Target</label>
                    <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0.00" className="w-full bg-[#111] border border-zinc-800 text-emerald-500 p-2 rounded focus:outline-none" />
                </div>
            </div>

            <button 
                onClick={handlePlaceOrder}
                className={`w-full py-3 font-black uppercase text-sm rounded tracking-wide shadow-lg ${action === "BUY" ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"}`}
            >
                Place {action} Order
            </button>
            <p className={"text-[10px] text-zinc-500 uppercase tracking-widest mt-2 text-center"}>Margin Req: ₹{(qty * (Number(price) || 48000) * 0.1).toFixed(2)}</p>
        </div>
    );
}
