import http from 'http';
import { Server, Socket } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to client URL in production environment
    methods: ['GET', 'POST'],
  },
});

// Store active connection statistics
let activeConnections = 0;

io.on('connection', (socket: Socket) => {
  activeConnections++;
  logger.info(`WebSocket Client connected [ID: ${socket.id}]. Active connections: ${activeConnections}`);

  // Join designated notification/telemetry rooms
  socket.on('join-room', (room: string) => {
    socket.join(room);
    logger.debug(`Socket client ${socket.id} joined room: ${room}`);
  });

  // Handle worker instant chat broadcasts (supervisor communications)
  socket.on('send-alert', (alertPayload: any) => {
    io.to('alerts-room').emit('new-alert', alertPayload);
    logger.info(`Broadcasted real-time safety alert: ${alertPayload.title}`);
  });

  socket.on('disconnect', () => {
    activeConnections--;
    logger.info(`WebSocket Client disconnected [ID: ${socket.id}]. Active connections: ${activeConnections}`);
  });
});

// --- REAL-TIME DATA SIMULATOR FOR DASHBOARD TELEMETRY ---
// Periodically emits randomized telemetry values to simulate active mine detectors.
setInterval(() => {
  if (activeConnections > 0) {
    const mockTelemetry = {
      timestamp: new Date(),
      environmental: {
        aqi: Math.floor(Math.random() * 25) + 40, // 40 - 65
        temperature: parseFloat((20 + Math.random() * 5).toFixed(1)), // 20 - 25 °C
        humidity: Math.floor(Math.random() * 15) + 40, // 40 - 55%
        methane: parseFloat((0.02 + Math.random() * 0.05).toFixed(3)), // ppm
        carbonMonoxide: parseFloat((1.0 + Math.random() * 1.5).toFixed(1)), // ppm
      },
      machines: [
        {
          id: 'mach-1',
          name: 'Primary Excavator EX-90',
          temperature: parseFloat((70 + Math.random() * 10).toFixed(1)), // °C
          vibration: parseFloat((2.0 + Math.random() * 0.8).toFixed(2)), // mm/s
          pressure: parseFloat((3.4 + Math.random() * 0.4).toFixed(2)), // bar
          oilLevel: parseFloat((90 - Math.random() * 2).toFixed(1)), // %
        },
        {
          id: 'mach-2',
          name: 'Haul Truck TR-44',
          temperature: parseFloat((65 + Math.random() * 8).toFixed(1)), // °C
          vibration: parseFloat((1.8 + Math.random() * 0.5).toFixed(2)), // mm/s
          pressure: parseFloat((3.2 + Math.random() * 0.3).toFixed(2)), // bar
          oilLevel: parseFloat((85 - Math.random() * 1).toFixed(1)), // %
        }
      ]
    };

    io.to('telemetry-room').emit('telemetry-update', mockTelemetry);
  }
}, 5000); // Send updates every 5 seconds

// Start Server & Database Connection
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  server.listen(PORT, () => {
    logger.info(`================================================================`);
    logger.info(`  AI Mining Platform Server running on HTTP port: ${PORT}       `);
    logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}         `);
    logger.info(`  WebSockets Engine active. Ready for client transactions.      `);
    logger.info(`================================================================`);
  });
};

startServer().catch((err) => {
  logger.error(`Critical error during server startup sequence: ${err.message}`);
});
