// src/Pages/Supervisor/ScopeOfWork/ScopeOfWork.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  TrendingUp as ProgressIcon,
  Assignment as ScopeIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const ScopeOfWork = () => {
  const { user } = useAuth();
  const [scopeData, setScopeData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editingData, setEditingData] = useState({ instock: '', done: '', remarks: '' });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock scope of work data
  const mockScopeData = [
    {
      id: 1,
      scopeOfWork: 'ALUMINIUM FRAMING',
      east: 51,
      west: 28,
      north: 116,
      south: 91,
      total: 286,
      unit: 'NOS.',
      instock: 50,
      done: 20,
      remarks: 'Work in progress on east side'
    },
    {
      id: 2,
      scopeOfWork: 'GI SHEET',
      east: 51,
      west: 28,
      north: 116,
      south: 91,
      total: 286,
      unit: 'NOS.',
      instock: 80,
      done: 45,
      remarks: 'Good quality material received'
    },
    {
      id: 3,
      scopeOfWork: 'MAMBREN',
      east: 51,
      west: 28,
      north: 116,
      south: 91,
      total: 286,
      unit: 'NOS.',
      instock: 286,
      done: 10,
      remarks: 'All material received'
    },
    {
      id: 4,
      scopeOfWork: 'ACP SHEET FIXING',
      east: 51,
      west: 28,
      north: 116,
      south: 91,
      total: 286,
      unit: 'NOS.',
      instock: 60,
      done: 35,
      remarks: 'Fixed on north and east walls'
    },
    {
      id: 5,
      scopeOfWork: 'GLASS REMOVING',
      east: 0,
      west: 180,
      north: 0,
      south: 0,
      total: 180,
      unit: 'NOS.',
      instock: 0,
      done: 0,
      remarks: 'No material received yet'
    }
  ];

  useEffect(() => {
    loadScopeData();
  }, []);

  const loadScopeData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScopeData(mockScopeData);
    } catch (error) {
      console.error('Error loading scope data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate balance: Total - Instock (material logistics)
  const calculateBalance = (total, instock) => {
    const totalNum = parseInt(total) || 0;
    const instockNum = parseInt(instock) || 0;
    
    return Math.max(0, totalNum - instockNum);
  };

  // Get display values for each row (including editing state)
  const getDisplayValues = useMemo(() => {
    return scopeData.map(item => {
      if (editingRow === item.id) {
        // Use editing values for real-time calculations
        const currentInstock = editingData.instock !== '' ? parseInt(editingData.instock) || 0 : item.instock;
        const currentDone = editingData.done !== '' ? parseInt(editingData.done) || 0 : item.done;
        const currentRemarks = editingData.remarks !== '' ? editingData.remarks : item.remarks;
        
        return {
          ...item,
          instock: currentInstock,
          done: currentDone,
          balance: calculateBalance(item.total, currentInstock),
          remarks: currentRemarks,
          isEditing: true
        };
      }
      
      // Use saved values
      return {
        ...item,
        balance: calculateBalance(item.total, item.instock),
        isEditing: false
      };
    });
  }, [scopeData, editingRow, editingData]);

  // Calculate summary from display values
  const summary = useMemo(() => {
    return getDisplayValues.reduce((acc, item) => ({
      totalItems: acc.totalItems + (parseInt(item.total) || 0),
      totalInstock: acc.totalInstock + (parseInt(item.instock) || 0),
      totalDone: acc.totalDone + (parseInt(item.done) || 0),
      totalBalance: acc.totalBalance + (parseInt(item.balance) || 0)
    }), { totalItems: 0, totalInstock: 0, totalDone: 0, totalBalance: 0 });
  }, [getDisplayValues]);

  const overallProgress = summary.totalItems > 0 ? (summary.totalDone / summary.totalItems) * 100 : 0;

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditingData({
      instock: row.instock.toString(),
      done: row.done.toString(),
      remarks: row.remarks || ''
    });
    setValidationError('');
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditingData({ instock: '', done: '', remarks: '' });
    setValidationError('');
  };

  const handleInstockChange = (e) => {
    const value = e.target.value;
    setEditingData(prev => ({
      ...prev,
      instock: value
    }));
    
    // Clear validation error when instock changes
    if (validationError) {
      setValidationError('');
    }
  };

  const handleDoneChange = (e) => {
    const value = e.target.value;
    const doneNum = parseInt(value) || 0;
    const instockNum = parseInt(editingData.instock) || 0;
    
    setEditingData(prev => ({
      ...prev,
      done: value
    }));
    
    // Real-time validation
    if (doneNum > instockNum) {
      setValidationError(`❌ Done quantity (${doneNum}) cannot exceed Instock quantity (${instockNum})!`);
    } else {
      setValidationError('');
    }
  };

  const handleRemarksChange = (e) => {
    setEditingData(prev => ({
      ...prev,
      remarks: e.target.value
    }));
  };

  const handleSave = async () => {
    const newInstock = parseInt(editingData.instock) || 0;
    const newDone = parseInt(editingData.done) || 0;
    const currentItem = scopeData.find(item => item.id === editingRow);
    
    // Validation
    if (newInstock < 0 || newDone < 0) {
      setSaveStatus('❌ Quantities cannot be negative!');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    if (newInstock > currentItem.total) {
      setSaveStatus(`❌ Instock quantity cannot exceed total quantity (${currentItem.total})!`);
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    if (newDone > newInstock) {
      setSaveStatus(`❌ Done quantity (${newDone}) cannot exceed Instock quantity (${newInstock})!`);
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      setSaveStatus('💾 Saving changes...');
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the data
      setScopeData(prev => prev.map(item => {
        if (item.id === editingRow) {
          return {
            ...item,
            instock: newInstock,
            done: newDone,
            remarks: editingData.remarks || '',
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      }));
      
      // Reset editing state
      setEditingRow(null);
      setEditingData({ instock: '', done: '', remarks: '' });
      setValidationError('');
      setSaveStatus('✅ Changes saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
    } catch (error) {
      setSaveStatus('❌ Failed to save changes. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getProgressPercentage = (done, total) => {
    const doneNum = parseInt(done) || 0;
    const totalNum = parseInt(total) || 0;
    return totalNum > 0 ? (doneNum / totalNum) * 100 : 0;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
          Scope of Work
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Project: {user?.assignedProjects?.[0]?.name || 'Current Project'}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {summary.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {summary.totalInstock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Received at Site
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {summary.totalDone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Work Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {summary.totalBalance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yet to Send
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Progress */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ProgressIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Work Progress: {overallProgress.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          color={getProgressColor(overallProgress)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Status Messages */}
      {saveStatus && (
        <Alert 
          severity={
            saveStatus.includes('✅') ? 'success' : 
            saveStatus.includes('💾') ? 'info' : 'error'
          }
          sx={{ mb: 3 }}
        >
          {saveStatus}
        </Alert>
      )}

      {validationError && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {validationError}
        </Alert>
      )}

      {/* Logic Explanation */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: '#e8f4f8' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          📋 How It Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2">
              <strong>Instock:</strong> Materials received at site
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2">
              <strong>Done:</strong> Work completed (≤ Instock)
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2">
              <strong>Balance:</strong> Total - Instock (yet to send)
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2">
              <strong>Available:</strong> Instock - Done (can be used)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Scope of Work Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  SCOPE OF WORK
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  EAST
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  WEST
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  NORTH
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  SOUTH
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  TOTAL
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  UNIT
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#4caf50', color: 'white' }}>
                  BALANCE
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#2196f3', color: 'white' }}>
                  INSTOCK ✏️
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#ff9800', color: 'white' }}>
                  DONE ✏️
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#9c27b0', color: 'white' }}>
                  REMARKS
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getDisplayValues.map((row, index) => {
                const isEditing = editingRow === row.id;
                const progress = getProgressPercentage(row.done, row.total);
                const hasValidationError = isEditing && parseInt(editingData.done || 0) > parseInt(editingData.instock || 0);
                const available = row.instock - row.done;
                
                return (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      '&:hover': { backgroundColor: '#e3f2fd' },
                      ...(isEditing && { backgroundColor: '#fff3e0' }),
                      ...(hasValidationError && { backgroundColor: '#ffebee' })
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row.scopeOfWork}</Typography>
                    </TableCell>
                    <TableCell align="center">{row.east || '-'}</TableCell>
                    <TableCell align="center">{row.west || '-'}</TableCell>
                    <TableCell align="center">{row.north || '-'}</TableCell>
                    <TableCell align="center">{row.south || '-'}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {row.total}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{row.unit}</TableCell>
                    
                    {/* Balance - Total - Instock */}
                    <TableCell align="center">
                      <Chip 
                        label={row.balance}
                        color={row.balance === 0 ? 'success' : 'warning'}
                        sx={{ 
                          fontWeight: 600, 
                          minWidth: 60,
                          ...(isEditing && {
                            backgroundColor: '#ffeb3b',
                            color: '#000',
                            fontWeight: 700
                          })
                        }}
                      />
                    </TableCell>
                    
                    {/* Instock - Editable by supervisor */}
                    <TableCell align="center">
                      {isEditing ? (
                        <TextField
                          type="number"
                          value={editingData.instock}
                          onChange={handleInstockChange}
                          size="small"
                          inputProps={{ 
                            min: 0, 
                            max: row.total,
                            step: 1
                          }}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        <Chip 
                          label={row.instock}
                          color="info"
                          sx={{ fontWeight: 600, minWidth: 60 }}
                        />
                      )}
                    </TableCell>
                    
                    {/* Done - Editable by supervisor */}
                    <TableCell align="center">
                      {isEditing ? (
                        <Box>
                          <TextField
                            type="number"
                            value={editingData.done}
                            onChange={handleDoneChange}
                            size="small"
                            inputProps={{ 
                              min: 0, 
                              step: 1
                            }}
                            sx={{ 
                              width: 80,
                              mb: 1,
                              ...(hasValidationError && {
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { borderColor: 'error.main' }
                                }
                              })
                            }}
                            error={hasValidationError}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Max: {editingData.instock || row.instock}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Chip 
                            label={row.done}
                            color="success"
                            sx={{ fontWeight: 600, minWidth: 60, mb: 0.5 }}
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={progress}
                            color={getProgressColor(progress)}
                            sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Available: {available}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    
                    {/* Remarks */}
                    <TableCell sx={{ minWidth: 200 }}>
                      {isEditing ? (
                        <TextField
                          value={editingData.remarks}
                          onChange={handleRemarksChange}
                          size="small"
                          multiline
                          rows={2}
                          fullWidth
                          placeholder="Add remarks..."
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {row.remarks || 'No remarks'}
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isEditing ? (
                          <>
                            <IconButton 
                              size="small" 
                              onClick={handleSave} 
                              color="success"
                              disabled={hasValidationError}
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancel}>
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => showItemDetails(row)} color="info">
                              <ViewIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Item Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScopeIcon sx={{ mr: 2 }} />
            {selectedItem?.scopeOfWork} - Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Total Required:</strong> {selectedItem.total} {selectedItem.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Work Progress:</strong> {getProgressPercentage(selectedItem.done, selectedItem.total).toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Received (Instock):</strong> {selectedItem.instock} {selectedItem.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Work Done:</strong> {selectedItem.done} {selectedItem.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="warning.main"><strong>Yet to Send:</strong> {selectedItem.balance} {selectedItem.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="success.main"><strong>Available to Use:</strong> {selectedItem.instock - selectedItem.done} {selectedItem.unit}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScopeOfWork;
