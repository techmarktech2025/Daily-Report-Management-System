// src/Pages/Supervisor/ScopeOfWork/ScopeOfWorkUpdated.jsx
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
import { useProject } from '../../../contexts/ProjectContext';

const ScopeOfWork = () => {
  const { user } = useAuth();
  const { getProjectBySupervisor, updateScopeProgress, needsConfirmation } = useProject();
  
  const [scopeData, setScopeData] = useState([]);
  const [project, setProject] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editingData, setEditingData] = useState({ instock: '', done: '', remarks: '' });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [authorizationStatus, setAuthorizationStatus] = useState('checking');

  useEffect(() => {
    loadProjectData();
  }, [user]);

  const loadProjectData = async () => {
    if (user && user.employeeId) {
      const userProject = getProjectBySupervisor(user.employeeId);
      
      if (userProject) {
        setProject(userProject);
        
        // Check if supervisor needs confirmation
        const needsAuth = needsConfirmation(userProject.id, user.employeeId);
        if (needsAuth) {
          setAuthorizationStatus('needs_confirmation');
        } else {
          setAuthorizationStatus('authorized');
          // Load scope data from project
          setScopeData(userProject.scopeOfWork || []);
        }
      } else {
        setAuthorizationStatus('no_project');
      }
    }
    setLoading(false);
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
        const currentInstock = editingData.instock !== '' ? parseInt(editingData.instock) || 0 : item.instock || 0;
        const currentDone = editingData.done !== '' ? parseInt(editingData.done) || 0 : item.done || 0;
        const currentRemarks = editingData.remarks !== '' ? editingData.remarks : item.remarks || '';
        
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
        instock: item.instock || 0,
        done: item.done || 0,
        balance: calculateBalance(item.total, item.instock || 0),
        remarks: item.remarks || '',
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
      instock: (row.instock || 0).toString(),
      done: (row.done || 0).toString(),
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
      
      // Update the local scope data
      const updatedScope = scopeData.map(item => {
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
      });

      setScopeData(updatedScope);

      // Update the project context with the changes
      const scopeUpdate = [{
        id: editingRow,
        instock: newInstock,
        done: newDone,
        remarks: editingData.remarks || '',
        lastUpdated: new Date().toISOString()
      }];

      updateScopeProgress(project.id, scopeUpdate);
      
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

  // Handle unauthorized access
  if (authorizationStatus === 'checking' || loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading scope of work...</Typography>
      </Container>
    );
  }

  if (authorizationStatus === 'needs_confirmation') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6">Authorization Required</Typography>
          <Typography>
            You need to complete the supervisor confirmation process before accessing scope of work.
            Please complete the project review and confirmation steps.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (authorizationStatus === 'no_project') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No project found for your supervisor ID. Please contact admin.
        </Alert>
      </Container>
    );
  }

  if (!scopeData || scopeData.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          No scope of work has been defined for this project yet. Please contact your project administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Scope of Work
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Project: {project?.projectName || 'Current Project'}
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {summary.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {summary.totalInstock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Received at Site
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {summary.totalDone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Work Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <ProgressIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Work Progress: {overallProgress.toFixed(1)}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          color={getProgressColor(overallProgress)}
          sx={{ height: 10, borderRadius: 2 }}
        />
      </Paper>

      {/* Status Messages */}
      {saveStatus && (
        <Alert severity={saveStatus.includes('✅') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {saveStatus}
        </Alert>
      )}

      {validationError && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {validationError}
        </Alert>
      )}

      {/* Logic Explanation */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📋 How It Works
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">
              <strong>Instock:</strong> Materials received at site
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">
              <strong>Done:</strong> Work completed (≤ Instock)
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">
              <strong>Balance:</strong> Total - Instock (yet to send)
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">
              <strong>Available:</strong> Instock - Done (can be used)
            </Typography>
          </Grid>
        </Grid>
      </Alert>

      {/* Scope of Work Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>SCOPE OF WORK</strong></TableCell>
              <TableCell align="center"><strong>EAST</strong></TableCell>
              <TableCell align="center"><strong>WEST</strong></TableCell>
              <TableCell align="center"><strong>NORTH</strong></TableCell>
              <TableCell align="center"><strong>SOUTH</strong></TableCell>
              <TableCell align="center"><strong>TOTAL</strong></TableCell>
              <TableCell align="center"><strong>UNIT</strong></TableCell>
              <TableCell align="center"><strong>BALANCE</strong></TableCell>
              <TableCell align="center"><strong>INSTOCK ✏️</strong></TableCell>
              <TableCell align="center"><strong>DONE ✏️</strong></TableCell>
              <TableCell><strong>REMARKS</strong></TableCell>
              <TableCell align="center"><strong>ACTIONS</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDisplayValues.map((row, index) => {
              const isEditing = editingRow === row.id;
              const progress = getProgressPercentage(row.done, row.total);
              const hasValidationError = isEditing && parseInt(editingData.done || 0) > parseInt(editingData.instock || 0);
              const available = row.instock - row.done;
              
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.scopeOfWork}</TableCell>
                  <TableCell align="center">{row.east || '-'}</TableCell>
                  <TableCell align="center">{row.west || '-'}</TableCell>
                  <TableCell align="center">{row.north || '-'}</TableCell>
                  <TableCell align="center">{row.south || '-'}</TableCell>
                  <TableCell align="center">
                    <strong>{row.total}</strong>
                  </TableCell>
                  <TableCell align="center">{row.unit}</TableCell>
                  {/* Balance - Total - Instock */}
                  <TableCell align="center">
                    <Chip 
                      label={row.balance} 
                      color="warning" 
                      size="small"
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
                        sx={{ width: 80 }}
                      />
                    ) : (
                      <strong>{row.instock}</strong>
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
                          error={hasValidationError}
                          size="small"
                          sx={{ width: 80 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Max: {editingData.instock || row.instock}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress}
                          color={getProgressColor(progress)}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                          <strong>{row.done}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Available: {available}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  {/* Remarks */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        multiline
                        rows={2}
                        value={editingData.remarks}
                        onChange={handleRemarksChange}
                        size="small"
                        sx={{ width: 200 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {row.remarks || 'No remarks'}
                      </Typography>
                    )}
                  </TableCell>
                  {/* Actions */}
                  <TableCell align="center">
                    {isEditing ? (
                      <>
                        <IconButton onClick={handleSave} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancel} color="secondary">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEdit(row)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => showItemDetails(row)} color="info">
                          <ViewIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Item Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <ScopeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {selectedItem?.scopeOfWork} - Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Total Required:</strong> {selectedItem.total} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Work Progress:</strong> {getProgressPercentage(selectedItem.done, selectedItem.total).toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Received (Instock):</strong> {selectedItem.instock} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Work Done:</strong> {selectedItem.done} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Yet to Send:</strong> {selectedItem.balance} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Available to Use:</strong> {selectedItem.instock - selectedItem.done} {selectedItem.unit}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScopeOfWork;