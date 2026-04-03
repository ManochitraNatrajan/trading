"use client";

import React from 'react';
import { useTerminalStore } from '@/store/useTerminalStore';
import { X } from 'lucide-react';

export default function TrackerCard() {
  const { isPanelOpen, setIsPanelOpen, selectedCandle, activeSymbol, watchlist } = useTerminalStore();

  if (!isPanelOpen || !selectedCandle) return null;

  const signal = selectedCandle.signal;
  const currentLtp = watchlist[activeSymbol]?.lastPrice || selectedCandle.close;
  
  let pnl = 0;
  let pnlColor = 'text-[#d1d4dc]';
  if (signal) {
    if (signal.action === 'BUY') {
      pnl = currentLtp - signal.entryPrice;
    } else {
      pnl = signal.entryPrice - currentLtp;
    }
    pnlColor = pnl > 0 ? 'text-[#26a69a]' : pnl < 0 ? 'text-[#ef5350]' : 'text-[#d1d4dc]';
  }

  const timeStr = new Date((selectedCandle.time as number) * 1000).toLocaleString();

  return (
    <div className="absolute top-1/2 right-[320px] -translate-y-1/2 w-80 bg-[#131722]/95 backdrop-blur-md border border-[#2B2B43] rounded-lg shadow-2xl z-50 text-[#d1d4dc] font-sans text-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e222d] border-b border-[#2B2B43] p-3 flex justify-between items-start">
        <div>
          <h2 className="text-[#2962ff] font-bold text-xs uppercase tracking-wider">Prathik Algo Lab</h2>
          <p className="text-xs text-[#787b86] font-medium tracking-wide">LIVE TRACKER</p>
        </div>
        <button onClick={() => setIsPanelOpen(false)} className="text-[#787b86] hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
          <span className="text-[#787b86]">Stock Name</span>
          <span className="font-bold text-base">{activeSymbol}</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
          <span className="text-[#787b86]">Candle Time</span>
          <span className="font-medium text-xs">{timeStr}</span>
        </div>

        {signal ? (
          <>
            <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
              <span className="text-[#787b86]">Status</span>
              <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                signal.status === 'BULL' ? 'bg-[#26a69a]/20 text-[#26a69a]' : 
                signal.status === 'BEAR' ? 'bg-[#ef5350]/20 text-[#ef5350]' : 
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {signal.status}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
              <span className="text-[#787b86]">Signal</span>
              <span className={`font-bold ${signal.action === 'BUY' ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                {signal.action} @ {signal.entryPrice}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
              <span className="text-[#787b86]">Target / SL</span>
              <span className="font-medium">
                <span className="text-[#26a69a]">{signal.target}</span> / <span className="text-[#ef5350]">{signal.stopLoss}</span>
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#2B2B43]/50">
              <span className="text-[#787b86]">Current LTP</span>
              <span className="font-bold">{currentLtp.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[#787b86] font-medium">Live P/L</span>
              <span className={`font-bold text-lg ${pnlColor}`}>
                {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
              </span>
            </div>
            
            {signal.reason && (
              <div className="mt-2 text-xs text-[#787b86] italic border-t border-[#2B2B43]/50 pt-2">
                Reason: {signal.reason}
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center text-[#787b86] text-xs">
            No signal on this candle.
          </div>
        )}
      </div>
    </div>
  );
}
