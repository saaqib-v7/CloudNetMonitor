import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ImsNode } from '../types';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const NodeCard: React.FC<ImsNode> = (node) => {
  const [showModal, setShowModal] = useState(false);
  const theme = useTheme();

  const getLoadColor = (value: number) => {
    if (value > 90) return theme.palette.error.main;
    if (value > 70) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <>
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
        onClick={() => setShowModal(true)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3">
              {node.name}
            </Typography>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: node.status === 'online' ? 'success.main' : 'error.main',
                animation: node.status === 'online' ? `${pulse} 2s infinite ease-in-out` : 'none',
              }}
            />
          </Box>

          <Typography color="textSecondary" gutterBottom>
            {node.type} - {node.ip}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">CPU</Typography>
                <Typography variant="body2">{Math.round(node.load.cpu)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={node.load.cpu}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getLoadColor(node.load.cpu),
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Memory</Typography>
                <Typography variant="body2">{Math.round(node.load.memory)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={node.load.memory}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getLoadColor(node.load.memory),
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Network</Typography>
                <Typography variant="body2">{Math.round(node.load.network)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={node.load.network}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getLoadColor(node.load.network),
                  },
                }}
              />
            </Box>
          </Box>

          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Last updated: {new Date(node.lastUpdated).toLocaleTimeString()}
          </Typography>
        </CardContent>
      </Card>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: node.status === 'online' ? 'success.main' : 'error.main',
                  animation: node.status === 'online' ? `${pulse} 2s infinite ease-in-out` : 'none',
                }}
              />
              <Typography variant="h6">{node.name}</Typography>
            </Box>
            <IconButton onClick={() => setShowModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Node Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">Type</Typography>
                  <Typography variant="body1">{node.type}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">IP Address</Typography>
                  <Typography variant="body1">{node.ip}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">Status</Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: node.status === 'online' ? 'success.main' : 'error.main' }}
                  >
                    {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Resource Usage
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2">{Math.round(node.load.cpu)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={node.load.cpu}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getLoadColor(node.load.cpu),
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Memory Usage</Typography>
                    <Typography variant="body2">{Math.round(node.load.memory)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={node.load.memory}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getLoadColor(node.load.memory),
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Network Usage</Typography>
                    <Typography variant="body2">{Math.round(node.load.network)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={node.load.network}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getLoadColor(node.load.network),
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography color="textSecondary" variant="body2">
                Last Updated: {new Date(node.lastUpdated).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NodeCard; 