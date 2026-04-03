import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSockets = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Allow user to subscribe to a specific symbol for live updates
    socket.on('subscribe_ticker', (symbol: string) => {
      console.log(`[Socket] Client ${socket.id} subscribed to ${symbol}`);
      socket.join(`ticker_${symbol}`);
    });

    socket.on('unsubscribe_ticker', (symbol: string) => {
      socket.leave(`ticker_${symbol}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  // Simulated live price feed for the dashboard Demo
  setInterval(() => {
    const symbols = ['BANKNIFTY', 'NIFTY50', 'RELIANCE', 'HDFCBANK', 'CRUDEOIL'];
    symbols.forEach(symbol => {
      // Base approx price
      const basePrice = symbol === 'BANKNIFTY' ? 48000 : 
                        symbol === 'NIFTY50' ? 22000 : 
                        symbol === 'RELIANCE' ? 2900 : 
                        symbol === 'CRUDEOIL' ? 6400 : 1400;

      // Randomwalk
      const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.005);
      
      io.to(`ticker_${symbol}`).emit('live_price', {
        symbol,
        price,
        timestamp: Date.now()
      });
    });
  }, 1000); // 1-second ticks

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
