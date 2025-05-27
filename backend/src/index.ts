import express from 'express';
import http from 'http';
import cors from 'cors';
import WebSocketService from './services/WebSocketService';
import { userService } from './services/UserService';
import { healthService } from './services/HealthService';
import { alertService } from './services/AlertService';
import { metricsService } from './services/MetricsService';

const app = express();
const port = process.env.PORT || 3001;
let wsService: WebSocketService;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());  // Add JSON body parser middleware

// Auth middleware
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!userService.verifyToken(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  next();
};

// Public endpoints
app.get('/api/metrics/public', (req, res) => {
  const metrics = metricsService.getMetrics('1h');
  res.json(metrics.systemMetrics);
});

// Protected endpoints
app.get('/api/nodes', authMiddleware, (req, res) => {
  const nodes = wsService.getNodes();
  res.json(nodes);
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await userService.authenticate(username, password);
    if (result) {
      res.json(result);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/health', authMiddleware, (req, res) => {
  try {
    const nodes = wsService.getNodes();
    const health = healthService.checkSystemHealth(nodes);
    res.json(health);
  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ message: 'Failed to fetch health data' });
  }
});

app.get('/api/alerts', authMiddleware, (req, res) => {
  try {
    const alerts = alertService.getAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

app.get('/api/alerts/rules', authMiddleware, (req, res) => {
  try {
    const rules = alertService.getRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    res.status(500).json({ message: 'Failed to fetch alert rules' });
  }
});

app.put('/api/alerts/rules/:ruleId', authMiddleware, (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;
    
    const success = alertService.updateRule(ruleId, updates);
    if (success) {
      const updatedRule = alertService.getRules().find(r => r.id === ruleId);
      res.json(updatedRule);
    } else {
      res.status(404).json({ message: 'Alert rule not found' });
    }
  } catch (error) {
    console.error('Error updating alert rule:', error);
    res.status(500).json({ message: 'Failed to update alert rule' });
  }
});

app.delete('/api/alerts/rules/:ruleId', authMiddleware, (req, res) => {
  try {
    const { ruleId } = req.params;
    const success = alertService.deleteRule(ruleId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Alert rule not found' });
    }
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    res.status(500).json({ message: 'Failed to delete alert rule' });
  }
});

app.post('/api/alerts/:alertId/acknowledge', authMiddleware, (req, res) => {
  const { alertId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  const userId = userService.getUserIdFromToken(token!);
  
  const success = alertService.acknowledgeAlert(alertId, userId);
  if (success) {
    const alert = alertService.getAlerts().find(a => a.id === alertId);
    res.json(alert);
  } else {
    res.status(404).json({ message: 'Alert not found' });
  }
});

app.put('/api/users/:userId/preferences', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const preferences = req.body;

  const updatedUser = userService.updateUserPreferences(userId, preferences);
  if (updatedUser) {
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize health service
    healthService.initialize();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket service
    wsService = new WebSocketService(server);

    // Initialize alert service with WebSocket service
    alertService.initialize(wsService);

    // Start server
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Clean up services on server shutdown
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Cleanup function
function cleanup() {
  console.log('Cleaning up services...');
  metricsService.cleanup();
  process.exit(0);
}

// Start the server
startServer(); 