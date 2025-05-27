import { useState, useEffect } from 'react';
import { ImsNode, WebSocketMessage, SystemStatus, SystemHealth, Alert } from '../types';
import { User } from '../../../backend/src/types';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket as useWebSocketContext } from '../contexts/WebSocketContext';

interface WebSocketState {
  nodes: ImsNode[];
  systemStatus: SystemStatus | null;
  health: SystemHealth | null;
  alerts: Alert[];
  users: User[];
  isConnected: boolean;
  error: string | null;
}

export function useWebSocket(): WebSocketState {
  const [nodes, setNodes] = useState<ImsNode[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { isConnected, lastMessage, connectionError } = useWebSocketContext();
  const { user } = useAuth();

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'NODE_UPDATE':
          setNodes(prev => {
            const nodeIndex = prev.findIndex(n => n.id === lastMessage.payload.id);
            if (nodeIndex >= 0) {
              const newNodes = [...prev];
              newNodes[nodeIndex] = lastMessage.payload;
              return newNodes;
            }
            return [...prev, lastMessage.payload];
          });
          break;

        case 'SYSTEM_STATUS':
          setSystemStatus(lastMessage.payload);
          break;

        case 'HEALTH_UPDATE':
          setHealth(lastMessage.payload);
          break;

        case 'ALERT_UPDATE':
          setAlerts(prev => [...prev, lastMessage.payload]);
          break;

        case 'USERS_UPDATE':
          // Only update users if the current user is an admin
          if (user?.role === 'admin') {
            setUsers(lastMessage.payload);
          }
          break;
      }
    }
  }, [lastMessage, user?.role]);

  return {
    nodes,
    systemStatus,
    health,
    alerts,
    users,
    isConnected,
    error: connectionError
  };
} 