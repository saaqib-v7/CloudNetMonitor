import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useWebSocket } from '../contexts/WebSocketContext';
import NodeCard from './NodeCard';

const Nodes: React.FC = () => {
  const { nodes, isConnected, connectionError } = useWebSocket();

  useEffect(() => {
    console.log('Nodes component state:', { 
      isConnected, 
      connectionError, 
      nodesCount: nodes.length,
      nodes: nodes 
    });
  }, [isConnected, connectionError, nodes]);

  if (!isConnected) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Connecting to server...</Typography>
        {connectionError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {connectionError}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {nodes.map((node) => (
          <Grid item xs={12} sm={6} md={4} key={node.id}>
            <NodeCard {...node} />
          </Grid>
        ))}
        {nodes.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No nodes available
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Nodes; 