"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';
import { useTerminalStore } from '@/store/useTerminalStore';
import Watchlist from '@/components/terminal/Watchlist';
import TrackerCard from '@/components/terminal/TrackerCard';
import { api } from '@/lib/api';

const LiveChart = dynamic(() => import('@/components/terminal/LiveChart'), { ssr: false });

export default function TerminalPage() {
  const { activeSymbol, updateWatchlist, addSignal, updateSignal, setSignals } = useTerminalStore();

  useEffect(() => {
    // 1. Initial Data Fetching
    const fetchInitialData = async () => {
      try {
        const signals = await api.getCurrentSignals(activeSymbol);
        if (Array.isArray(signals)) {
          setSignals(signals);
        }
      } catch (err) {
        console.error("Error fetching signals", err);
      }
    };
    fetchInitialData();

    // 2. WebSocket connection
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    // Connect to the specific namespace if required or rely on path
    const socket = io(`${socketUrl}/trades/live`, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("Terminal WebSocket Connected");
      socket.emit("subscribe", activeSymbol);
    });

    // Handle incoming price ticks
    socket.on("tick", (data: any) => {
      if (data && data.symbol) {
        updateWatchlist({
          symbol: data.symbol,
          lastPrice: data.lastPrice || data.price,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
        });
      }
    });

    // Handle new signals
    socket.on("signal", (data: any) => {
      addSignal(data);
    });
    
    // Handle status updates on signals
    socket.on("signalUpdate", (data: any) => {
      updateSignal(data.id, data);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeSymbol, updateWatchlist, addSignal, updateSignal, setSignals]);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-black text-[#d1d4dc] font-sans">
      <div className="flex-1 relative border-r border-[#2B2B43]">
        <LiveChart symbol={activeSymbol} />
        <TrackerCard />
      </div>
      <div className="w-[300px] flex-shrink-0 bg-[#1e222d]">
        <Watchlist />
      </div>
    </div>
  );
}
