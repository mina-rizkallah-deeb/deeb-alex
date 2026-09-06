import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './backend/config/database.js';
import { securityHeaders, limiter, authLimiter } from './backend/middleware/security.js';
import authRoutes from './backend/routes/auth.js';
import toolsRoutes from './backend/routes/tools.js';
import toolsExecutor from './backend/routes/tools-execute.js';
import walletRoutes from './backend/routes/wallet.js';
import userRoutes from './backend/routes/user.js';
import adminRoutes from './backend/routes/admin.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(securityHeaders);
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://deeb-alex.vercel.app' : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/tools', toolsExecutor);
app.use('/api/wallet', walletRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'Deeb Alex v1.0',
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Deeb Alex API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tools: '/api/tools',
      wallet: '/api/wallet',
      user: '/api/user',
      admin: '/api/admin'
    }
  });
});

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   🔐 DEEB ALEX PLATFORM                   ║
║              Professional Penetration Testing             ║
║         Ethical Hacking & Cybersecurity Tools             ║
╚═══════════════════════════════════════════════════════════╝

✅ Server running on port ${PORT}
📍 API URL: http://localhost:${PORT}/api
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started: ${new Date().toISOString()}
🛡️ Security: Enabled
⚡ Performance: Optimized

🔗 Available Endpoints:
   • POST   /api/auth/register
   • POST   /api/auth/login
   • GET    /api/tools/mobile
   • GET    /api/tools/desktop
   • POST   /api/tools/:toolId/execute
   • GET    /api/wallet/balance
   • POST   /api/wallet/payment/initiate
   • GET    /api/user/profile
   • PUT    /api/user/profile
   • GET    /api/user/statistics
   • POST   /api/admin/manual-credit (Admin only)

💡 Test: curl http://localhost:${PORT}/api/health
  `);
});

export default app;
