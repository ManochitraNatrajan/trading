import { create } from 'zustand';

export interface SignalData {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryTime: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  target: number;
  status: 'BULL' | 'BEAR' | 'WAITING' | 'CLOSED';
  pnl?: number;
  reason?: string;
}

export interface WatchlistSymbol {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
}

export interface SelectedCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  signal?: SignalData; 
}

interface TerminalState {
  watchlist: Record<string, WatchlistSymbol>;
  signals: SignalData[];
  selectedCandle: SelectedCandle | null;
  isPanelOpen: boolean;
  activeSymbol: string;
  
  // Actions
  updateWatchlist: (data: WatchlistSymbol) => void;
  setSignals: (signals: SignalData[]) => void;
  addSignal: (signal: SignalData) => void;
  updateSignal: (id: string, updates: Partial<SignalData>) => void;
  setSelectedCandle: (candle: SelectedCandle | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
  setActiveSymbol: (symbol: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  watchlist: {},
  signals: [],
  selectedCandle: null,
  isPanelOpen: false,
  activeSymbol: 'TCS',

  updateWatchlist: (data) =>
    set((state) => ({
      watchlist: {
        ...state.watchlist,
        [data.symbol]: data,
      },
    })),
    
  setSignals: (signals) => set({ signals }),
  
  addSignal: (signal) => set((state) => ({ signals: [...state.signals, signal] })),
  
  updateSignal: (id, updates) => set((state) => ({
    signals: state.signals.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  
  setSelectedCandle: (candle) => set({ selectedCandle: candle }),
  
  setIsPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
}));
