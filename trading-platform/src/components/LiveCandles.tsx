"use client";
import { useEffect, useState } from "react";

const INITIAL_DATA = [
  {o: 80, c: 85, h: 90, l: 75}, {o: 85, c: 92, h: 95, l: 82}, {o: 92, c: 88, h: 96, l: 85}, {o: 88, c: 95, h: 100, l: 85}, {o: 95, c: 105, h: 110, l: 90}, 
  {o: 105, c: 115, h: 120, l: 100}, {o: 115, c: 130, h: 135, l: 110}, {o: 130, c: 138, h: 145, l: 125}, {o: 138, c: 132, h: 142, l: 128}, {o: 132, c: 120, h: 135, l: 115}, {o: 120, c: 105, h: 125, l: 100}, {o: 105, c: 100, h: 110, l: 95}, 
  {o: 100, c: 110, h: 115, l: 95}, {o: 110, c: 135, h: 140, l: 105}, {o: 135, c: 160, h: 165, l: 130}, {o: 160, c: 180, h: 185, l: 155}, {o: 180, c: 186, h: 195, l: 175}, {o: 186, c: 175, h: 190, l: 170}, {o: 175, c: 155, h: 180, l: 150}, {o: 155, c: 135, h: 160, l: 130}, {o: 135, c: 115, h: 140, l: 110}, {o: 115, c: 105, h: 120, l: 100}, {o: 105, c: 98, h: 110, l: 95}, 
  {o: 98, c: 110, h: 115, l: 95}, {o: 110, c: 125, h: 130, l: 105}, {o: 125, c: 132, h: 140, l: 120}, {o: 132, c: 125, h: 138, l: 120}, {o: 125, c: 110, h: 130, l: 105}, {o: 110, c: 95, h: 115, l: 90}, 
  {o: 95, c: 80, h: 100, l: 75}, {o: 80, c: 65, h: 85, l: 60}, {o: 65, c: 70, h: 75, l: 55}, {o: 70, c: 55, h: 72, l: 50}, {o: 55, c: 45, h: 60, l: 40}
];

export default function LiveCandles() {
  const [data, setData] = useState(INITIAL_DATA);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastCandle = prev[prev.length - 1];
        const newOpen = lastCandle.c;
        const rand = (Math.random() - 0.5) * 15; // move by up to 15 points
        const newClose = newOpen + rand;
        const newHigh = Math.max(newOpen, newClose) + Math.random() * 5;
        const newLow = Math.min(newOpen, newClose) - Math.random() * 5;
        
        // Keep max length constraint to avoid pushing candles out of bounds
        const nextArr = [...prev, { o: newOpen, c: newClose, h: newHigh, l: newLow }];
        if (nextArr.length > 55) nextArr.shift();
        
        return nextArr;
      });
    }, 2000); // Add a new live candle every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-end justify-end px-6 pb-8 pt-24 opacity-80 overflow-hidden w-full h-full pointer-events-none">
      {data.map((candle, i) => {
        const isGreen = candle.c >= candle.o;
        const minScale = 10;
        const range = 200;
        
        const wickBottom = ((candle.l - minScale) / range) * 100;
        const wickHeight = ((candle.h - candle.l) / range) * 100;
        
        const bodyBottom = ((Math.min(candle.o, candle.c) - minScale) / range) * 100;
        const bodyHeight = Math.max(((Math.abs(candle.o - candle.c)) / range) * 100, 0.5);

        return (
          <div key={i} className="relative flex flex-col items-center flex-1 max-w-[15px] h-full mx-[2px] transition-all duration-300 ease-in-out group pointer-events-auto">
            <div 
              className={`absolute w-[1px] ${isGreen ? 'bg-emerald-500' : 'bg-red-500'} transition-all duration-300`}
              style={{ bottom: `${wickBottom}%`, height: `${wickHeight}%` }}
            />
            <div 
              className={`absolute w-full rounded-[1px] ${isGreen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'} transition-all duration-300`}
              style={{ bottom: `${bodyBottom}%`, height: `${bodyHeight}%` }}
            />
            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-zinc-800 text-xs px-2 py-1 rounded shadow-lg transition-opacity z-50 whitespace-nowrap pointer-events-none text-zinc-300">
              O: {Math.floor(candle.o)} C: {Math.floor(candle.c)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
