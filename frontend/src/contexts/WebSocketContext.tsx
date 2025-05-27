import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WebSocketMessage, ImsNode, SystemStatus } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
  reconnect: () => void;
  socket: WebSocket | null;
  nodes: ImsNode[];
  systemStatus: SystemStatus | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
  connectionError: null,
  reconnect: () => {},
  socket: null,
  nodes: [],
  systemStatus: null
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<ImsNode[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const { token, user } = useAuth();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second

  const cleanup = useCallback(() => {
    isConnectingRef.current = false;
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null; // Clear ref before closing to prevent reconnection attempts
      ws.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    setIsConnected(false);
    setNodes([]);
    setSystemStatus(null);
  }, []);

  const connect = useCallback(() => {
    if (!token || !user) {
      setConnectionError('No authentication token available');
      return;
    }

    // Prevent multiple connection attempts
    if (isConnectingRef.current || wsRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      console.log('Connecting to WebSocket...');
      const ws = new WebSocket(`ws://localhost:3001?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current === ws) { // Only update state if this is still the current connection
          console.log('WebSocket Connected');
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false;
        }
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return; // Ignore messages from old connections
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          setLastMessage(message);

          switch (message.type) {
            case 'NODE_UPDATE':
              setNodes(prev => {
                const nodeIndex = prev.findIndex(n => n.id === message.payload.id);
                if (nodeIndex >= 0) {
                  const newNodes = [...prev];
                  newNodes[nodeIndex] = message.payload;
                  return newNodes;
                }
                return [...prev, message.payload];
              });
              break;

            case 'SYSTEM_STATUS':
              console.log('Received system status:', message.payload);
              setSystemStatus(message.payload);
              break;

            case 'HEALTH_UPDATE':
              // Handle health updates if needed
              break;

            case 'ALERT_UPDATE':
              // Handle alert updates if needed
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (wsRef.current !== ws) return; // Only handle close for current connection
        
        console.log('WebSocket Disconnected:', event.code);
        setIsConnected(false);
        wsRef.current = null;
        isConnectingRef.current = false;

        // Don't reconnect if closed normally or due to authentication failure
        if (event.code === 1000 || event.code === 1008) {
          setConnectionError(event.code === 1008 ? 'Authentication failed' : null);
          return;
        }

        // Don't reconnect if we've hit the maximum attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Maximum reconnection attempts reached');
          return;
        }

        // Calculate exponential backoff delay with jitter
        const jitter = Math.random() * 1000;
        const delay = Math.min(
          baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current) + jitter,
          30000
        );

        console.log(`Reconnecting in ${delay}ms (Attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current !== ws) return; // Don't reconnect if we have a new connection
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        if (wsRef.current !== ws) return; // Only handle errors for current connection
        
        console.error('WebSocket Error:', error);
        isConnectingRef.current = false;
        // Only set connection error if we're not already trying to reconnect
        if (!reconnectTimeoutRef.current) {
          setConnectionError('Connection error occurred');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
      isConnectingRef.current = false;
    }
  }, [token, user]);

  // Initial connection and cleanup
  useEffect(() => {
    let isMounted = true;
    
    if (token && user && isMounted) {
      // Reset reconnect attempts
      reconnectAttemptsRef.current = 0;
      // Attempt to connect
      connect();
    } else {
      // Clean up when token or user is not available
      cleanup();
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [token, user, connect, cleanup]);

  // Reconnect function that can be called manually
  const reconnect = useCallback(() => {
    cleanup();
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    connect();
  }, [cleanup, connect]);

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, 
      lastMessage, 
      connectionError, 
      reconnect,
      socket: wsRef.current,
      nodes,
      systemStatus
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 