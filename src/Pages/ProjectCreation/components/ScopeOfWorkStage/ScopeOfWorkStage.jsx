// src/Pages/ProjectCreation/components/ScopeOfWorkStage/ScopeOfWorkStageEnhanced.jsx
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Alert,
  Grid,
  Card,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Delete as Delete,
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Visibility as PreviewIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ScopeOfWorkStage = ({ data, onComplete, onNext, onBack }) => {
  const [finalScopeData, setFinalScopeData] = useState(data?.length > 0 ? data : []);
  const [uploadedScopeData, setUploadedScopeData] = useState([]);
  const [showVirtualTable, setShowVirtualTable] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Excel Upload Handler
  const handleExcelUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setUploadStatus('❌ Please upload a valid CSV or Excel file');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('📊 Processing Excel file...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process the data - expect columns: SCOPE OF WORK, EAST, WEST, NORTH, SOUTH, UNIT
        const processedData = jsonData.slice(1).map((row, index) => {
          if (row.length >= 6 && row[0]) { // Ensure minimum columns and scope name exists
            const east = Number(row[1]) || 0;
            const west = Number(row[2]) || 0;
            const north = Number(row[3]) || 0;
            const south = Number(row[4]) || 0;
            const total = east + west + north + south;
            
            return {
              id: Date.now() + index,
              scopeOfWork: row[0].toString().trim(),
              east: east,
              west: west,
              north: north,
              south: south,
              total: total,
              unit: row[5] ? row[5].toString().trim() : 'NOS.',
              status: 'pending_review'
            };
          }
          return null;
        }).filter(Boolean);

        if (processedData.length === 0) {
          setUploadStatus('❌ No valid scope data found in file. Please check the format.');
        } else {
          setUploadedScopeData(processedData);
          setShowVirtualTable(true);
          setUploadStatus(`✅ ${processedData.length} scope items loaded successfully! Please review and approve.`);
        }

      } catch (error) {
        console.error('Excel processing error:', error);
        setUploadStatus('❌ Error processing Excel file. Please check the format and try again.');
      } finally {
        setIsUploading(false);
        setTimeout(() => {
          if (!uploadStatus.includes('❌')) {
            setUploadStatus('');
          }
        }, 5000);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset file input
  }, [uploadStatus]);

  // Template Download
  const downloadTemplate = () => {
    const headers = ['SCOPE OF WORK', 'EAST', 'WEST', 'NORTH', 'SOUTH', 'UNIT'];
    const sampleRows = [
      ['ALUMINIUM FRAMING', '51', '28', '116', '91', 'NOS.'],
      ['GI SHEET', '51', '28', '116', '91', 'NOS.'],
      ['ACP SHEET FIXING', '51', '28', '116', '91', 'NOS.'],
      ['GLASS REMOVING', '0', '180', '0', '0', 'NOS.'],
      ['SILICON SEALING', '51', '28', '116', '91', 'NOS.']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scope_of_work_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Virtual Table Edit Functions
  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({ ...row });
  };

  const handleSaveEdit = () => {
    const updatedData = {
      ...editData,
      east: Number(editData.east) || 0,
      west: Number(editData.west) || 0,
      north: Number(editData.north) || 0,
      south: Number(editData.south) || 0
    };
    updatedData.total = updatedData.east + updatedData.west + updatedData.north + updatedData.south;

    setUploadedScopeData(prev =>
      prev.map(item =>
        item.id === editingId ? updatedData : item
      )
    );
    setEditingId(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Are you sure you want to delete this scope item?')) {
      setUploadedScopeData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddRow = () => {
    const newId = Date.now();
    const newRow = {
      id: newId,
      scopeOfWork: '',
      east: 0,
      west: 0,
      north: 0,
      south: 0,
      total: 0,
      unit: 'NOS.',
      status: 'pending_review'
    };
    setUploadedScopeData(prev => [...prev, newRow]);
    setEditingId(newId);
    setEditData(newRow);
  };

  // Approve and Add to Final List
  const handleApproveScope = () => {
    if (uploadedScopeData.length === 0) return;

    const approvedData = uploadedScopeData.map(item => ({
      ...item,
      status: 'approved',
      approvedAt: new Date().toISOString()
    }));

    setFinalScopeData(prev => [...prev, ...approvedData]);
    setUploadedScopeData([]);
    setShowVirtualTable(false);
    setUploadStatus(`✅ ${approvedData.length} scope items approved and added to project!`);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Handle Next
  const handleNext = () => {
    if (finalScopeData.length === 0) {
      setUploadStatus('❌ Please add at least one scope item before proceeding.');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }
    onComplete(finalScopeData);
    onNext();
  };

  const calculateGrandTotal = (data) => {
    return data.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: { xs: 3, sm: 4 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 600
        }}
      >
        Stage 2: Scope of Work
      </Typography>

      {/* Upload Status */}
      {uploadStatus && (
        <Alert 
          severity={
            uploadStatus.includes('✅') ? 'success' : 
            uploadStatus.includes('❌') ? 'error' : 'info'
          } 
          sx={{ mb: 3 }}
        >
          {uploadStatus}
        </Alert>
      )}

      {/* Upload Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Upload Scope of Work
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload Excel/CSV file with columns: SCOPE OF WORK, EAST, WEST, NORTH, SOUTH, UNIT
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                component="label"
                variant="contained"
                startIcon={isUploading ? <LinearProgress size={20} /> : <UploadIcon />}
                disabled={isUploading}
                sx={{ backgroundColor: '#1976d2' }}
              >
                {isUploading ? 'Processing...' : 'Upload Excel/CSV'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                />
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Supported formats: .xlsx, .xls, .csv
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, backgroundColor: '#f8f9fa', textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Current Status
            </Typography>
            <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
              {finalScopeData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scope Items Added
            </Typography>
            {uploadedScopeData.length > 0 && (
              <>
                <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                  {uploadedScopeData.length} items pending review
                </Typography>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Virtual Table for Review */}
      {showVirtualTable && uploadedScopeData.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#fff3e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              📋 Review Uploaded Data ({uploadedScopeData.length} items)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                size="small"
              >
                Add Row
              </Button>
              <Button
                variant="contained"
                startIcon={<ApproveIcon />}
                onClick={handleApproveScope}
                color="success"
                disabled={uploadedScopeData.length === 0}
              >
                Approve All ({uploadedScopeData.length})
              </Button>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>Please review the data carefully.</strong> You can edit any field by clicking the edit icon. Click "Approve All" to add these items to your project.
          </Alert>

          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              maxHeight: { xs: 400, md: 600 },
              '& .MuiTable-root': {
                minWidth: 800
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>SCOPE OF WORK</strong></TableCell>
                  <TableCell align="center"><strong>EAST</strong></TableCell>
                  <TableCell align="center"><strong>WEST</strong></TableCell>
                  <TableCell align="center"><strong>NORTH</strong></TableCell>
                  <TableCell align="center"><strong>SOUTH</strong></TableCell>
                  <TableCell align="center"><strong>TOTAL</strong></TableCell>
                  <TableCell align="center"><strong>UNIT</strong></TableCell>
                  <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedScopeData.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={editData.scopeOfWork || ''}
                          onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
                          sx={{ minWidth: 200 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.scopeOfWork}
                        </Typography>
                      )}
                    </TableCell>

                    {['east', 'west', 'north', 'south'].map(direction => (
                      <TableCell align="center" key={direction}>
                        {editingId === row.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editData[direction] || 0}
                            onChange={(e) => handleInputChange(direction, e.target.value)}
                            sx={{ width: 70 }}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: row[direction] > 0 ? 600 : 400 }}>
                            {row[direction] || '-'}
                          </Typography>
                        )}
                      </TableCell>
                    ))}

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {editingId === row.id 
                          ? (Number(editData.east) || 0) + (Number(editData.west) || 0) + (Number(editData.north) || 0) + (Number(editData.south) || 0)
                          : row.total
                        }
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          value={editData.unit || ''}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          sx={{ width: 70 }}
                        />
                      ) : (
                        <Typography variant="body2">
                          {row.unit}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      {editingId === row.id ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={handleSaveEdit} color="success" size="small">
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={handleCancelEdit} color="error" size="small">
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={() => handleEdit(row)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRow(row.id)} color="error" size="small">
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Grand Total Row */}
                <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                  <TableCell><strong>GRAND TOTAL</strong></TableCell>
                  <TableCell align="center">
                    <strong>{uploadedScopeData.reduce((sum, item) => sum + (Number(item.east) || 0), 0)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{uploadedScopeData.reduce((sum, item) => sum + (Number(item.west) || 0), 0)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{uploadedScopeData.reduce((sum, item) => sum + (Number(item.north) || 0), 0)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{uploadedScopeData.reduce((sum, item) => sum + (Number(item.south) || 0), 0)}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{calculateGrandTotal(uploadedScopeData)}</strong>
                  </TableCell>
                  <TableCell align="center"><strong>NOS.</strong></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Final Approved Scope Items */}
      {finalScopeData.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              ✅ Approved Scope Items ({finalScopeData.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreviewDialog(true)}
            >
              Preview Final List
            </Button>
          </Box>

          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>{finalScopeData.length} scope items</strong> have been approved and will be included in the project. 
            Grand Total: <strong>{calculateGrandTotal(finalScopeData)} items</strong>
          </Alert>

          {/* Summary Cards */}
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {finalScopeData.reduce((sum, item) => sum + (Number(item.east) || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">East Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {finalScopeData.reduce((sum, item) => sum + (Number(item.west) || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">West Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {finalScopeData.reduce((sum, item) => sum + (Number(item.north) || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">North Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {finalScopeData.reduce((sum, item) => sum + (Number(item.south) || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">South Total</Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          mt: 4 
        }}
      >
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
        <Button 
          onClick={handleNext}
          variant="contained"
          disabled={finalScopeData.length === 0}
          sx={{ minWidth: 200 }}
        >
          Next: Materials & Tools ({finalScopeData.length} items)
        </Button>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onClose={() => setShowPreviewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Final Scope of Work Preview</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Scope of Work</strong></TableCell>
                  <TableCell align="center"><strong>East</strong></TableCell>
                  <TableCell align="center"><strong>West</strong></TableCell>
                  <TableCell align="center"><strong>North</strong></TableCell>
                  <TableCell align="center"><strong>South</strong></TableCell>
                  <TableCell align="center"><strong>Total</strong></TableCell>
                  <TableCell><strong>Unit</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {finalScopeData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.scopeOfWork}</TableCell>
                    <TableCell align="center">{item.east || 0}</TableCell>
                    <TableCell align="center">{item.west || 0}</TableCell>
                    <TableCell align="center">{item.north || 0}</TableCell>
                    <TableCell align="center">{item.south || 0}</TableCell>
                    <TableCell align="center"><strong>{item.total}</strong></TableCell>
                    <TableCell>{item.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScopeOfWorkStage;