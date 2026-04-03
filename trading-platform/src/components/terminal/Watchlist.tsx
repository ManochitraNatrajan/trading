"use client";

import React from 'react';
import { useTerminalStore } from '@/store/useTerminalStore';

export default function Watchlist() {
  const { watchlist, activeSymbol, setActiveSymbol } = useTerminalStore();

  const symbols = Object.values(watchlist);

  return (
    <div className="w-full h-full bg-[#1e222d] text-[#d1d4dc] flex flex-col border-l border-[#2B2B43]">
      <div className="p-3 font-semibold text-sm border-b border-[#2B2B43] flex justify-between bg-[#131722]">
        <span>Watchlist</span>
      </div>
      
      <div className="flex text-xs text-[#787b86] p-2 border-b border-[#2B2B43]">
        <div className="flex-1">Symbol</div>
        <div className="w-16 text-right">Last</div>
        <div className="w-16 text-right">Chg</div>
        <div className="w-16 text-right">Chg%</div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#2B2B43]">
        {symbols.map((item) => {
          const isUp = item.change >= 0;
          const colorClass = isUp ? 'text-[#26a69a]' : 'text-[#ef5350]';
          const isActive = item.symbol === activeSymbol;

          return (
            <div 
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              className={`flex items-center text-xs p-2 cursor-pointer hover:bg-[#2a2e39] transition-colors ${isActive ? 'bg-[#2a2e39] border-l-2 border-[#2962ff]' : 'border-l-2 border-transparent'}`}
            >
              <div className="flex-1 font-semibold truncate pr-2" title={item.symbol}>
                {item.symbol}
              </div>
              <div className="w-16 text-right">
                {item.lastPrice.toFixed(2)}
              </div>
              <div className={`w-16 text-right ${colorClass}`}>
                {isUp ? '+' : ''}{item.change.toFixed(2)}
              </div>
              <div className={`w-16 text-right ${colorClass}`}>
                {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </div>
          );
        })}
        {symbols.length === 0 && (
          <div className="p-4 text-center text-xs text-[#787b86]">
            Waiting for live data...
          </div>
        )}
      </div>
    </div>
  );
}
