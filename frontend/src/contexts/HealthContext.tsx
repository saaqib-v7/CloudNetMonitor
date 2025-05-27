import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SystemHealth } from '../../../backend/src/types';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

interface HealthContextType {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { socket } = useWebSocket();

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setError(null);
      } else {
        setError('Failed to fetch system health data');
      }
    } catch (error) {
      setError('Error connecting to health service');
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Load initial health data
    fetchHealth();

    // Listen for health updates from WebSocket
    if (socket) {
      const handleWebSocketMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === 'HEALTH_UPDATE') {
          setHealth(message.payload);
          setLoading(false);
          setError(null);
        }
      };

      socket.addEventListener('message', handleWebSocketMessage);
      return () => {
        socket.removeEventListener('message', handleWebSocketMessage);
      };
    }
  }, [token, socket, fetchHealth]);

  return (
    <HealthContext.Provider
      value={{
        health,
        loading,
        error,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}; 