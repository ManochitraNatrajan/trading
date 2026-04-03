"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, ISeriesApi, SeriesMarker, Time, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import { useTerminalStore, SelectedCandle, SignalData } from '@/store/useTerminalStore';
import { api } from '@/lib/api';

interface LiveChartProps {
  symbol: string;
}

export default function LiveChart({ symbol }: LiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { signals, setSelectedCandle, setIsPanelOpen } = useTerminalStore();
  const [chart, setChart] = useState<any>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const seriesMarkersRef = useRef<any>(null);
  
  // Keep refs of data for click handler
  const dataRef = useRef<any[]>([]);
  const signalsRef = useRef<SignalData[]>([]);

  useEffect(() => {
    signalsRef.current = signals;
  }, [signals]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = newChart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    seriesMarkersRef.current = createSeriesMarkers(candlestickSeries, []);

    setChart(newChart);
    setSeries(candlestickSeries);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
    };
  }, []);

  // Fetch initial history
  useEffect(() => {
    if (!series || !symbol) return;

    const loadData = async () => {
      try {
        const history = await api.getTradeHistory(symbol, "1");
        // format expected: { time: number, open: number, high: number, low: number, close: number }
        // Ensure data is sorted by time and transformed
        const formatted = history.map((d: any) => ({
          time: (new Date(d.time || d.timestamp).getTime() / 1000) as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })).sort((a: any, b: any) => (a.time as number) - (b.time as number));

        // Deduplicate data by time to prevent lightweight-charts error
        const uniqueFormatted = Array.from(new Map(formatted.map((item: any) => [item.time, item])).values());
        
        series.setData(uniqueFormatted as any);
        dataRef.current = uniqueFormatted;
        
        updateMarkers();
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    loadData();
  }, [series, symbol]);

  // Handle Markers
  const updateMarkers = () => {
    if (!series || !signalsRef.current) return;
    const markers: SeriesMarker<Time>[] = [];
    
    signalsRef.current.forEach(sig => {
      if (sig.symbol === symbol) {
        markers.push({
          time: (new Date(sig.entryTime).getTime() / 1000) as Time,
          position: sig.action === 'BUY' ? 'belowBar' : 'aboveBar',
          color: sig.action === 'BUY' ? '#26a69a' : '#ef5350',
          shape: sig.action === 'BUY' ? 'arrowUp' : 'arrowDown',
          text: sig.action,
        });
      }
    });
    
    // Sort markers by time
    markers.sort((a, b) => (a.time as number) - (b.time as number));
    if (seriesMarkersRef.current) {
      seriesMarkersRef.current.setMarkers(markers);
    }
  };

  useEffect(() => {
    updateMarkers();
  }, [signals, series, symbol]);

  // Handle Clicks
  useEffect(() => {
    if (!chart || !series) return;

    const clickHandler = (param: any) => {
      if (!param.point || !param.time) return;

      const candleData = param.seriesData.get(series);
      if (candleData) {
        // Check if there is a signal near this time
        const signal = signalsRef.current.find(s => 
          s.symbol === symbol && 
          Math.abs(new Date(s.entryTime).getTime() / 1000 - (param.time as number)) < 120 // within 2 minutes 
        );

        const selected: SelectedCandle = {
          time: param.time as number,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          signal
        };

        setSelectedCandle(selected);
        setIsPanelOpen(true);
      }
    };

    chart.subscribeClick(clickHandler);

    return () => {
      chart.unsubscribeClick(clickHandler);
    };
  }, [chart, series, symbol, setSelectedCandle, setIsPanelOpen]);

  return (
    <div className="w-full h-full bg-black relative">
      <div className="absolute top-4 left-4 z-10 text-white font-bold text-xl uppercase tracking-wider mix-blend-difference pointer-events-none">
        {symbol} - Live
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
