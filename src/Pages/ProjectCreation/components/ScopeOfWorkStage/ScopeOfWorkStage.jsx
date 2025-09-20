// src/Pages/ProjectCreation/components/ScopeOfWorkStage/ScopeOfWorkStage.jsx
import React, { useState } from 'react';
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
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Sample data matching the Excel format from the image
const sampleScopeData = [
  { id: 1, scopeOfWork: 'ALUMINIUM FRAMING', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 2, scopeOfWork: 'GI SHEET', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 3, scopeOfWork: 'MAMBREN', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 4, scopeOfWork: 'ACP SHEET FIXING', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 5, scopeOfWork: 'SILICON', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 6, scopeOfWork: 'PAPER REMOVING', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 7, scopeOfWork: 'GLASS REMOVING', east: 0, west: 180, north: 0, south: 0, total: 180, unit: 'NOS.' },
  { id: 8, scopeOfWork: 'GI TRAY FIXING', east: 180, west: 0, north: 0, south: 0, total: 180, unit: 'NOS.' },
  { id: 9, scopeOfWork: 'INSULATION FIXING', east: 0, west: 0, north: 0, south: 180, total: 180, unit: 'NOS.' },
  { id: 10, scopeOfWork: 'GLASS REFIXING', east: 180, west: 0, north: 0, south: 0, total: 180, unit: 'NOS.' },
  { id: 11, scopeOfWork: 'SILICON FILLING', east: 180, west: 0, north: 0, south: 0, total: 180, unit: 'NOS.' },
  { id: 12, scopeOfWork: 'CLIP REMOVING', east: 0, west: 180, north: 0, south: 0, total: 180, unit: 'NOS.' }
];

const ScopeOfWorkStage = ({ data, onComplete, onNext, onBack }) => {
  const [scopeData, setScopeData] = useState(data?.length > 0 ? data : []);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        setUploadStatus('Please upload a valid CSV or Excel file');
        setTimeout(() => setUploadStatus(''), 3000);
        return;
      }

      setUploadStatus('Processing file...');
      setTimeout(() => {
        setScopeData(sampleScopeData);
        setUploadStatus('File uploaded successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      }, 1500);
    }
  };

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

    setScopeData(prev => 
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
      [field]: field === 'scopeOfWork' || field === 'unit' ? value : value
    }));
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setScopeData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddRow = () => {
    const newId = Math.max(...scopeData.map(item => item.id), 0) + 1;
    const newRow = {
      id: newId,
      scopeOfWork: '',
      east: 0,
      west: 0,
      north: 0,
      south: 0,
      total: 0,
      unit: 'NOS.'
    };
    setScopeData(prev => [...prev, newRow]);
    setEditingId(newId);
    setEditData(newRow);
  };

  const handleNext = () => {
    onComplete(scopeData);
    onNext();
  };

  const downloadTemplate = () => {
    const headers = ['SCOPE OF WORK', 'EAST', 'WEST', 'NORTH', 'SOUTH', 'TOTAL', 'UNIT'];
    const sampleRows = [
      ['ALUMINIUM FRAMING', '51', '28', '116', '91', '286', 'NOS.'],
      ['GI SHEET', '51', '28', '116', '91', '286', 'NOS.'],
      ['GLASS REMOVING', '0', '180', '0', '0', '180', 'NOS.']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scope_of_work_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateGrandTotal = () => {
    return scopeData.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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

      {/* Upload Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Scope of work:
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
                sx={{
                  backgroundColor: '#000',
                  color: 'white',
                  '&:hover': { backgroundColor: '#333' },
                  minWidth: '120px'
                }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              CSV/XLSX file
            </Typography>
            
            {uploadStatus && (
              <Alert 
                severity={uploadStatus.includes('success') ? 'success' : uploadStatus.includes('Please') ? 'error' : 'info'} 
                sx={{ mt: 2 }}
              >
                {uploadStatus}
              </Alert>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                For view (detail Scope of Work)
              </Typography>
              {scopeData.length > 0 && (
                <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                  {scopeData.length} items loaded
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Template Download */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
          If not having scope Format download:
        </Typography>
        <Button
          variant="text"
          onClick={downloadTemplate}
          startIcon={<DownloadIcon />}
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          Download Template
        </Button>
      </Box>

      {/* Data Table */}
      {scopeData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Scope of Work Items ({scopeData.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              size="small"
            >
              Add Item
            </Button>
          </Box>

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
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 200 }}>
                    SCOPE OF WORK
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    EAST
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    WEST
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    NORTH
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    SOUTH
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 80 }}>
                    UNIT
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 120 }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scopeData.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
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
                          sx={{ minWidth: 180 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          {row.scopeOfWork}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.east || 0}
                          onChange={(e) => handleInputChange('east', e.target.value)}
                          sx={{ width: 70 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: row.east > 0 ? 600 : 400 }}>
                          {row.east || '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.west || 0}
                          onChange={(e) => handleInputChange('west', e.target.value)}
                          sx={{ width: 70 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: row.west > 0 ? 600 : 400 }}>
                          {row.west || '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.north || 0}
                          onChange={(e) => handleInputChange('north', e.target.value)}
                          sx={{ width: 70 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: row.north > 0 ? 600 : 400 }}>
                          {row.north || '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.south || 0}
                          onChange={(e) => handleInputChange('south', e.target.value)}
                          sx={{ width: 70 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: row.south > 0 ? 600 : 400 }}>
                          {row.south || '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        fontSize: '0.9rem'
                      }}>
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
                        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                          {row.unit}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={handleSaveEdit} color="primary">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteRow(row.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Grand Total Row */}
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    GRAND TOTAL
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {scopeData.reduce((sum, item) => sum + (Number(item.east) || 0), 0)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {scopeData.reduce((sum, item) => sum + (Number(item.west) || 0), 0)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {scopeData.reduce((sum, item) => sum + (Number(item.north) || 0), 0)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {scopeData.reduce((sum, item) => sum + (Number(item.south) || 0), 0)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                    {calculateGrandTotal()}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    NOS.
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        mt: 4
      }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            minHeight: { xs: '48px', sm: '56px' },
            px: { xs: 3, sm: 4 },
            order: { xs: 2, sm: 1 }
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={scopeData.length === 0}
          sx={{
            minHeight: { xs: '48px', sm: '56px' },
            px: { xs: 3, sm: 4 },
            order: { xs: 1, sm: 2 }
          }}
        >
          Next: Add Manpower
        </Button>
      </Box>
    </Paper>
  );
};

export default ScopeOfWorkStage;
