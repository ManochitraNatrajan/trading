"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, createTextWatermark } from "lightweight-charts";
import { io, Socket } from "socket.io-client";

interface TradingChartProps {
  symbol: string;
}

export default function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [timeframe, setTimeframe] = useState("1m");
  const [indicators, setIndicators] = useState({ ema: true, rsi: false, macd: false });
  const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, data?: any }>({ visible: false, x: 0, y: 0 });
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#050505" },
        textColor: "#D9D9D9",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    // Create text watermark for lightweight charts v5
    // Create text watermark for lightweight charts v5
    if (chart.panes && chart.panes().length > 0) {
        createTextWatermark(chart.panes()[0], {
            horzAlign: 'center',
            vertAlign: 'center',
            lines: [
               {
                   text: `PRATHIK ALGO - ${symbol}`,
                   color: 'rgba(255, 255, 255, 0.05)',
                   fontSize: 48,
               }
            ]
        });
    }

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Generate initial dummy historical data
    const initialData = [];
    let currentTime = Math.floor(Date.now() / 1000) - (100 * 60); // 100 mins ago
    let lastClose = symbol === "BANKNIFTY" ? 48000 : 22000;

    for (let i = 0; i < 100; i++) {
        const o = lastClose;
        const h = o + Math.random() * 50;
        const l = o - Math.random() * 50;
        const c = l + Math.random() * (h - l);
        initialData.push({ time: currentTime as Time, open: o, high: h, low: l, close: c });
        lastClose = c;
        currentTime += 60; // 1 min increment
    }
    candlestickSeries.setData(initialData);

    // 2. Setup Socket Connect
    const socket = io("http://localhost:5000"); // Standard dev port
    socketRef.current = socket;

    socket.emit("subscribe_ticker", symbol);

    socket.on("live_price", (data: { symbol: string, price: number, timestamp: number }) => {
      if (data.symbol === symbol) {
          // Update the last candle
          const t = Math.floor(data.timestamp / 1000) as Time;
          
          // Get the last bar from our state roughly
          // lightweight-charts updates via update()
          // For a true tick updater, we either construct the bar or update the closing price
          // Simplified here to just update a rough new bar every minute or modify the current one.
          
          // Simulate 1 min bar aggregation conceptually:
          // Since it's a demo, we will just push new bars frequently or update the last one.
          // Let's just update the last close for the demo so it wriggles.
          
          const currentPrice = data.price;
          // In a real app we'd fetch the latest bar from state or keep track of OHLC.
          // Mock update:
          candlestickSeries.update({
              time: t,
              open: currentPrice * 0.9999, // mock
              high: currentPrice * 1.0005,
              low: currentPrice * 0.9995,
              close: currentPrice
          });
      }
    });

    // Handle clicks
    chart.subscribeClick((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
         setTooltip((prev) => ({ ...prev, visible: false }));
         return;
      }

      const data = param.seriesData.get(candlestickSeries) as any;
      let clickedOnCandle = false;

      if (data && data.high !== undefined && data.low !== undefined) {
        const yHigh = candlestickSeries.priceToCoordinate(data.high);
        const yLow = candlestickSeries.priceToCoordinate(data.low);

        if (yHigh !== null && yLow !== null) {
            // High price is physically lower Y (top of screen is 0)
            const topY = Math.min(yHigh, yLow);
            const bottomY = Math.max(yHigh, yLow);
            
            // Add a generous 10px buffer to make clicking easier
            const buffer = 10;
            if (param.point.y >= topY - buffer && param.point.y <= bottomY + buffer) {
                clickedOnCandle = true;
            }
        }
      }

      if (clickedOnCandle) {
        // Clicked directly vertically on a candle -> Show Prathik Algo Lab Tooltip
        setTooltip({
          visible: true,
          x: param.point.x,
          y: param.point.y,
          data: data
        });
      } else {
        // Clicked empty terminal area -> Hide Tooltip, Toggle Live Tracker
        setTooltip((prev) => ({ ...prev, visible: false }));
        setShowTracker((prev) => !prev);
      }
    });

    // Resize handler
    const handleResize = () => {
      chart.applyOptions({
          width: chartContainerRef.current?.clientWidth,
          height: chartContainerRef.current?.clientHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.disconnect();
      chart.remove();
    };
  }, [symbol]);

  const [trackerData, setTrackerData] = useState([
    { stock: 'TCS', status: 'BULL', entry: 2414.2, ltp: 2360.0 },
    { stock: 'TATAMOTORS', status: 'BULL', entry: 320.8, ltp: 317.2 },
    { stock: 'ITC', status: 'BULL', entry: 297.4, ltp: 296.0 },
    { stock: 'L&T', status: 'BULL', entry: 3611.0, ltp: 3656.0 },
    { stock: 'DIXON', status: 'BULL', entry: 10495.2, ltp: 10400.0 },
    { stock: 'COALINDIA', status: 'WAITING', entry: 0, ltp: 443.9 },
    { stock: 'MCX', status: 'WAITING', entry: 0, ltp: 2459.0 },
    { stock: 'SUNPHARMA', status: 'BULL', entry: 1779.9, ltp: 1800.0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
        setTrackerData(prev => prev.map(item => ({
            ...item,
            ltp: item.ltp + (Math.random() - 0.5) * 5
        })));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
        {/* Chart Header (Timeframes & Indicators) */}
        <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white mr-4">{symbol}</span>
                {["1m", "5m", "15m", "1H", "4H", "1D"].map(tf => (
                    <button 
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                        {tf}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIndicators(p => ({...p, ema: !p.ema}))} className={`px-2 py-1 text-xs font-semibold rounded border ${indicators.ema ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-zinc-700 text-zinc-400'}`}>EMA</button>
                <button onClick={() => setIndicators(p => ({...p, rsi: !p.rsi}))} className={`px-2 py-1 text-xs font-semibold rounded border ${indicators.rsi ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-zinc-700 text-zinc-400'}`}>RSI</button>
                <button onClick={() => setIndicators(p => ({...p, macd: !p.macd}))} className={`px-2 py-1 text-xs font-semibold rounded border ${indicators.macd ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-zinc-700 text-zinc-400'}`}>MACD</button>
            </div>
        </div>

        {/* Chart Container */}
        <div ref={chartContainerRef} className="flex-1 w-full relative">
            {/* Overlay texts based on selection */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                {indicators.ema && <span className="text-xs text-blue-400">EMA 9 <span className="text-white">48,204.15</span></span>}
                {indicators.rsi && <span className="text-xs text-purple-400">RSI 14 <span className="text-white">54.2</span></span>}
                {indicators.macd && <span className="text-xs text-orange-400">MACD 12,26 <span className="text-white">12.5</span></span>}
            </div>

            {/* Click Tooltip Overlay (Prathik Algo Lab Box) */}
            {tooltip.visible && tooltip.data && (
                <div 
                    className="absolute z-50 bg-[#1e222d] border border-zinc-700/50 rounded shadow-2xl overflow-hidden pointer-events-none"
                    style={{ left: Math.min(tooltip.x + 15, chartContainerRef.current?.clientWidth ? chartContainerRef.current.clientWidth - 230 : tooltip.x), top: tooltip.y + 15, minWidth: '220px' }}
                >
                    <div className="bg-zinc-800/80 px-3 py-2 border-b border-zinc-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white tracking-widest">🏆 PRATHIK ALGO LAB 🏆</span>
                    </div>
                    <div className="p-3 space-y-2 text-[11px] font-semibold">
                        <div className="flex justify-between"><span className="text-zinc-400">LICENSE STATUS:</span> <span className="text-emerald-500">✅ ACTIVE</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">CONTACT:</span> <span className="text-zinc-100">9042701119</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">BOOKED P/L:</span> <span className="text-blue-400">₹{Math.floor((tooltip.data.close - tooltip.data.open) * 50)}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">RUNNING P/L:</span> <span className="text-blue-400">₹{Math.floor((tooltip.data.high - tooltip.data.low) * 25)}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">WIN RATE:</span> <span className="text-zinc-100">45.17%</span></div>
                    </div>
                    <div className="bg-emerald-600 px-3 py-1 text-center">
                        <span className="text-[10px] font-black text-white">KADAN ILLA THALAIMURAI SEIVOM</span>
                    </div>
                    <div className="bg-zinc-900 px-2 py-0.5 text-center">
                        <span className="text-[8px] text-zinc-500 tracking-tighter">⚠️ Disclaimer: Trading is risky. Not SEBI Registered.</span>
                    </div>
                </div>
            )}

            {/* LIVE TRACKER OVERLAY */}
            {showTracker && (
            <div className="absolute right-4 bottom-12 z-50 w-[300px] bg-[#1e222d] border border-zinc-700 overflow-hidden shadow-2xl rounded text-[10px] font-sans pointer-events-none transition-all duration-200">
                <div className="bg-blue-600 text-white font-black tracking-widest text-center py-1.5 text-xs">
                    PRATHIK ALGO LAB
                </div>
                <div className="bg-blue-500 text-white font-bold tracking-widest text-center py-1 border-b border-zinc-700/50">
                    LIVE TRACKER
                </div>
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="bg-zinc-800 text-orange-400 border-b border-zinc-700 py-1">
                            <th className="py-1 px-1 border-r border-zinc-700 w-[25%] font-medium">STOCK</th>
                            <th className="py-1 px-1 border-r border-zinc-700 w-[15%] font-medium">STATUS</th>
                            <th className="py-1 px-1 border-r border-zinc-700 w-[20%] font-medium">ENTRY</th>
                            <th className="py-1 px-1 border-r border-zinc-700 w-[20%] font-medium">LTP</th>
                            <th className="py-1 px-1 w-[20%] font-medium">P/L (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trackerData.map((row, i) => {
                            const pnl = row.status === 'WAITING' ? null : (row.ltp - row.entry).toFixed(2);
                            const pnlColor = pnl ? (parseFloat(pnl) >= 0 ? "text-emerald-500" : "text-red-500") : "text-zinc-500";
                            
                            return (
                                <tr key={row.stock} className={`border-b border-zinc-700 whitespace-nowrap ${i % 2 === 0 ? 'bg-[#1e222d]' : 'bg-[#2a2e39]'}`}>
                                    <td className="py-1.5 px-1 font-bold text-white border-r border-zinc-700">{row.stock}</td>
                                    <td className={`py-1.5 px-1 font-bold border-r border-zinc-700 ${row.status === 'WAITING' ? 'text-zinc-400' : 'text-emerald-500'}`}>{row.status}</td>
                                    <td className="py-1.5 px-1 text-orange-400 border-r border-zinc-700 font-medium">{row.status === 'WAITING' ? '-' : row.entry.toFixed(1)}</td>
                                    <td className="py-1.5 px-1 text-cyan-400 border-r border-zinc-700 font-medium">{row.ltp.toFixed(1)}</td>
                                    <td className={`py-1.5 px-1 font-bold ${pnlColor}`}>{pnl !== null ? pnl : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="bg-zinc-800 py-1 text-center border-t border-zinc-700 text-yellow-500 font-bold tracking-wide">
                    Contact: +91 90427 01119
                </div>
                <div className="bg-zinc-900 py-0.5 text-center text-[7px] text-zinc-500 uppercase">
                    Disclaimer: NOT a SEBI Registered Analyst.
                </div>
            </div>
            )}
        </div>
    </div>
  );
}
