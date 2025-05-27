type MessageCallback = (message: any) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.ws = new WebSocket(`ws://localhost:3001?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.connectionCallbacks.forEach(cb => cb(true));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.connectionCallbacks.forEach(cb => cb(false));
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
      this.connectionCallbacks.forEach(cb => cb(false));
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message.type, message.payload);
        this.messageCallbacks.forEach(cb => cb(message));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    console.log('Scheduling reconnect...');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000);
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  subscribe(callback: MessageCallback) {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService; 