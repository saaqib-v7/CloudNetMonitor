import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAlerts } from '../contexts/AlertContext';
import { AlertRule } from '../../../backend/src/types';

type AlertRuleFormData = Omit<AlertRule, 'id'>;

const defaultFormData: AlertRuleFormData = {
  name: '',
  type: 'cpu',
  condition: 'gt',
  threshold: 80,
  severity: 'high',
  enabled: true,
};

const AlertRules: React.FC = () => {
  const { rules, addRule, updateRule, deleteRule } = useAlerts();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AlertRuleFormData>(defaultFormData);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const handleOpen = () => {
    setFormData(defaultFormData);
    setEditingRule(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(defaultFormData);
    setEditingRule(null);
  };

  const handleEdit = (rule: AlertRule) => {
    setFormData({
      name: rule.name,
      type: rule.type,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: rule.enabled,
    });
    setEditingRule(rule.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRule(id);
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await updateRule(editingRule, formData);
      } else {
        await addRule(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  };

  const handleChange = (field: keyof AlertRuleFormData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value =
      field === 'enabled'
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Alert Rules</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Rule
        </Button>
      </Box>

      <Paper>
        <List>
          {rules.map((rule) => (
            <ListItem
              key={rule.id}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
              }}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEdit(rule)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{rule.name}</Typography>
                    <Switch
                      size="small"
                      checked={rule.enabled}
                      onChange={async (e) => {
                        await updateRule(rule.id, {
                          enabled: e.target.checked,
                        });
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    {`${rule.type.toUpperCase()} ${rule.condition} ${rule.threshold}% for ${rule.duration}s • Severity: ${rule.severity}`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleChange('type')}
                  label="Type"
                >
                  <MenuItem value="cpu">CPU Usage</MenuItem>
                  <MenuItem value="memory">Memory Usage</MenuItem>
                  <MenuItem value="network">Network Usage</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={handleChange('condition')}
                  label="Condition"
                >
                  <MenuItem value="gt">Greater Than</MenuItem>
                  <MenuItem value="lt">Less Than</MenuItem>
                  <MenuItem value="eq">Equal To</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Threshold (%)"
                type="number"
                value={formData.threshold}
                onChange={handleChange('threshold')}
                required
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />

              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={handleChange('severity')}
                  label="Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={handleChange('enabled')}
                  />
                }
                label={<Typography>Enabled</Typography>}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default AlertRules; 