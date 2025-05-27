# CloudNetMonitor

A comprehensive network monitoring and management solution for cloud infrastructure, featuring real-time metrics, VoLTE traffic simulation, and advanced networking capabilities.

## Features

### 1. Real-time Monitoring
- Live dashboard with system metrics (CPU, Memory, Network)
- Node status monitoring and management
- WebSocket-based real-time updates
- Customizable alert rules and notifications

### 2. Network Simulation
- Docker-based network node simulation
- Configurable network conditions (latency, packet loss)
- Real-time traffic monitoring
- VoLTE/IMS traffic generation

### 3. Security
- JWT-based authentication
- Role-based access control
- SSL/TLS encryption
- Rate limiting and DDoS protection

### 4. Web Interface
- Modern React-based frontend
- Material-UI components
- Responsive design
- Dark/Light theme support

## Technology Stack

### Frontend
- React 18
- Material-UI
- Chart.js for metrics visualization
- WebSocket for real-time updates
- TypeScript

### Backend
- Node.js
- Express.js
- WebSocket server
- JWT authentication
- TypeScript

### Network Tools
- Docker networking
- Nginx reverse proxy
- Network simulation tools
- VoLTE/SIP traffic generator

### Testing
- Robot Framework
- Selenium for UI testing
- API testing suite
- Network simulation tests

## Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker
- Kubernetes (optional)

### Development Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/cloudnetmonitor.git
cd cloudnetmonitor
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Testing
cd ../tests
pip install -r requirements.txt
```

3. Generate SSL certificates:
```bash
./scripts/generate_ssl.sh
```

4. Start the development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
```

### Docker Deployment
```bash
# Build and run using docker-compose
docker-compose up --build
```

### Kubernetes Deployment
```bash
# Add Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update dependencies
cd helm/cloudnetmonitor
helm dependency update

# Install the chart
helm install cloudnet-prod .
```

## Network Simulation Tools

### Basic Network Simulation
```bash
./scripts/network_sim.sh
```

### VoLTE Traffic Generation
```bash
python scripts/volte_simulator.py
```

## Testing

### Run All Tests
```bash
./tests/run_tests.sh
```

### API Tests
```bash
cd tests/api
robot metrics_api.robot
```

### UI Tests
```bash
cd tests/ui
robot dashboard_ui.robot
```

## Project Structure
```
cloudnetmonitor/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── scripts/           # Network simulation scripts
├── tests/            # Test suites
├── helm/             # Kubernetes Helm charts
├── nginx/            # Nginx configuration
└── docker-compose.yml # Docker composition
```

## Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Backend server port
- `JWT_SECRET`: JWT signing key
- `DB_URL`: Database connection string

### Nginx Configuration
- SSL/TLS settings in `nginx/nginx.conf`
- Reverse proxy configuration
- WebSocket support
- Rate limiting rules

### Kubernetes Configuration
- Resource limits and requests
- Replica counts
- Service types
- Environment variables

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Acknowledgments
- Material-UI for the component library
- Docker for containerization
- Kubernetes for orchestration
- Robot Framework for testing
