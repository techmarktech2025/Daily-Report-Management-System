// src/Pages/ProjectCreation/components/ToolsStage/ToolsStage.jsx
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

// Sample tools data
const sampleToolsData = [
  { id: 1, tools: 'Drill Machine', quantity: 123456 },
  { id: 2, tools: 'Hammer', quantity: 123456 },
  { id: 3, tools: 'Screwdriver Set', quantity: 123456 },
  { id: 4, tools: 'Measuring Tape', quantity: 123456 },
  { id: 5, tools: 'Level Tool', quantity: 123456 },
  { id: 6, tools: 'Safety Helmet', quantity: 123456 },
  { id: 7, tools: 'Welding Machine', quantity: 123456 }
];

const ToolsStage = ({ data, onComplete, onProjectComplete, onBack }) => {
  const [toolsData, setToolsData] = useState(data?.length > 0 ? data : []);
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
        setToolsData(sampleToolsData);
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
      quantity: Number(editData.quantity) || 0
    };

    setToolsData(prev => 
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
      [field]: field === 'tools' ? value : value
    }));
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      setToolsData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddRow = () => {
    const newId = Math.max(...toolsData.map(item => item.id), 0) + 1;
    const newRow = {
      id: newId,
      tools: '',
      quantity: 0
    };
    setToolsData(prev => [...prev, newRow]);
    setEditingId(newId);
    setEditData(newRow);
  };

  const handleCompleteProject = () => {
    onComplete(toolsData);
    onProjectComplete();
  };

  const downloadTemplate = () => {
    const headers = ['Tools', 'Quantity'];
    const sampleRows = [
      ['Drill Machine', '123456'],
      ['Hammer', '123456'],
      ['Screwdriver Set', '123456']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tools_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
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
        Stage 4: Tools at Site
      </Typography>

      {/* Upload Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Tools:
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
          <Card 
            variant="outlined" 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#e3f2fd' 
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Tools
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                Quantity
              </Typography>
              {toolsData.length > 0 && (
                <Typography variant="body1" color="primary" sx={{ mt: 2, fontWeight: 500 }}>
                  {toolsData.length} tool types loaded
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Template Download */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
          If not having Format download:
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
      {toolsData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Tools List ({toolsData.length} items)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              size="small"
            >
              Add Tool
            </Button>
          </Box>

          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              maxHeight: { xs: 400, md: 600 },
              '& .MuiTable-root': {
                minWidth: 500
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 300 }}>
                    Tools
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 150 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white', minWidth: 120 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {toolsData.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? '#e3f2fd' : 'white',
                      '&:hover': { backgroundColor: '#bbdefb' }
                    }}
                  >
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={editData.tools || ''}
                          onChange={(e) => handleInputChange('tools', e.target.value)}
                          placeholder="[Tools Data]"
                          sx={{ minWidth: 250 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                          {row.tools || '[Tools Data]'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingId === row.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editData.quantity || 0}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Typography sx={{ 
                          fontWeight: 600, 
                          color: 'primary.main',
                          fontSize: '0.9rem'
                        }}>
                          {row.quantity || 123456}
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
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Project Summary Section */}
      {toolsData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 600 }}>
            Every site Tool List to superadmin
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 1 }}
          >
            + Add Section
          </Button>
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
          onClick={handleCompleteProject}
          disabled={toolsData.length === 0}
          sx={{
            minHeight: { xs: '48px', sm: '56px' },
            px: { xs: 3, sm: 4 },
            order: { xs: 1, sm: 2 },
            backgroundColor: 'success.main',
            '&:hover': { backgroundColor: 'success.dark' }
          }}
        >
          Complete Project
        </Button>
      </Box>
    </Paper>
  );
};

export default ToolsStage;
