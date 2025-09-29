// src/Pages/ProjectCreation/components/MaterialToolListStage/MaterialToolListStageEnhanced.jsx
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
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  Inventory as MaterialIcon,
  Build as ToolIcon
} from '@mui/icons-material';


const ToolsStage = ({ data, onComplete, onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Materials, 1 = Tools
  
  // Final approved data
  const [finalMaterials, setFinalMaterials] = useState(data?.materials || []);
  const [finalTools, setFinalTools] = useState(data?.tools || []);
  
  // Upload review data
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [uploadedTools, setUploadedTools] = useState([]);
  
  // UI states
  const [showMaterialTable, setShowMaterialTable] = useState(false);
  const [showToolTable, setShowToolTable] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Manual add data
  const [newItem, setNewItem] = useState({
    name: '',
    unit: '',
    quantity: '',
    description: '',
    category: '',
    specifications: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Material Excel Upload Handler
  const handleMaterialExcelUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setUploadStatus('❌ Please upload a valid CSV or Excel file');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('📊 Processing Material Excel file...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process materials - expect columns: SR.NO, MATERIAL NAME, UNIT, QUANTITY, SPECIFICATIONS, DESCRIPTION
        const processedMaterials = jsonData.slice(1).map((row, index) => {
          if (row.length >= 3 && row[1]) { // Ensure minimum columns and material name exists
            return {
              id: Date.now() + index,
              srNo: row[0] || index + 1,
              materialName: row[1].toString().trim(),
              unit: row[2] ? row[2].toString().trim() : 'Nos',
              quantity: row[3] ? Number(row[3]) || 0 : 0,
              specifications: row[4] ? row[4].toString().trim() : '',
              description: row[5] ? row[5].toString().trim() : '',
              category: 'material',
              status: 'pending_review'
            };
          }
          return null;
        }).filter(Boolean);

        if (processedMaterials.length === 0) {
          setUploadStatus('❌ No valid material data found in file. Please check the format.');
        } else {
          setUploadedMaterials(processedMaterials);
          setShowMaterialTable(true);
          setUploadStatus(`✅ ${processedMaterials.length} materials loaded successfully! Please review and approve.`);
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

  // Tool Excel Upload Handler
  const handleToolExcelUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setUploadStatus('❌ Please upload a valid CSV or Excel file');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('🔧 Processing Tool Excel file...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process tools - expect columns: SR.NO, TOOL NAME, QUANTITY, SPECIFICATIONS, DESCRIPTION
        const processedTools = jsonData.slice(1).map((row, index) => {
          if (row.length >= 2 && row[1]) { // Ensure minimum columns and tool name exists
            return {
              id: Date.now() + index,
              srNo: row[0] || index + 1,
              toolName: row[1].toString().trim(),
              quantity: row[2] ? Number(row[2]) || 0 : 0,
              specifications: row[3] ? row[3].toString().trim() : '',
              description: row[4] ? row[4].toString().trim() : '',
              category: 'tool',
              status: 'pending_review'
            };
          }
          return null;
        }).filter(Boolean);

        if (processedTools.length === 0) {
          setUploadStatus('❌ No valid tool data found in file. Please check the format.');
        } else {
          setUploadedTools(processedTools);
          setShowToolTable(true);
          setUploadStatus(`✅ ${processedTools.length} tools loaded successfully! Please review and approve.`);
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

  // Template Downloads
  const downloadMaterialTemplate = () => {
    const headers = ['SR.NO', 'MATERIAL NAME', 'UNIT', 'QUANTITY', 'SPECIFICATIONS', 'DESCRIPTION'];
    const sampleRows = [
      ['1', 'Portland Cement', 'Bags', '100', '53 Grade', 'High quality cement for construction'],
      ['2', 'Steel Rods', 'Kg', '500', '12mm TMT', 'Fe500D grade steel reinforcement bars'],
      ['3', 'Sand', 'Cubic Meter', '10', 'River Sand', 'Fine aggregate for concrete'],
      ['4', 'Bricks', 'Pieces', '1000', 'Red Clay', 'Standard size building bricks'],
      ['5', 'Paint', 'Liters', '20', 'Exterior', 'Weather resistant wall paint']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'materials_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadToolTemplate = () => {
    const headers = ['SR.NO', 'TOOL NAME', 'QUANTITY', 'SPECIFICATIONS', 'DESCRIPTION'];
    const sampleRows = [
      ['1', 'Drill Machine', '5', 'Heavy Duty 13mm', 'Electric drill for construction work'],
      ['2', 'Hammer', '10', '500g Steel', 'Claw hammer for general construction'],
      ['3', 'Level Tool', '3', '2 Feet Spirit Level', 'Precision leveling instrument'],
      ['4', 'Measuring Tape', '8', '5 Meter Steel', 'Retractable measuring tape'],
      ['5', 'Safety Helmet', '50', 'ISI Marked', 'Hard hat for worker protection']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tools_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Edit Functions
  const handleEdit = (item, type) => {
    setEditingId(item.id);
    setEditData({ ...item, type });
  };

  const handleSaveEdit = () => {
    const isEditingMaterial = editData.type === 'material' || editData.category === 'material';
    
    if (isEditingMaterial) {
      setUploadedMaterials(prev =>
        prev.map(item =>
          item.id === editingId ? { ...editData, category: 'material' } : item
        )
      );
    } else {
      setUploadedTools(prev =>
        prev.map(item =>
          item.id === editingId ? { ...editData, category: 'tool' } : item
        )
      );
    }
    
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

  const handleDeleteRow = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'material') {
        setUploadedMaterials(prev => prev.filter(item => item.id !== id));
      } else {
        setUploadedTools(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  // Approve Functions
  const handleApproveMaterials = () => {
    if (uploadedMaterials.length === 0) return;

    const approvedMaterials = uploadedMaterials.map(item => ({
      id: item.id,
      materialName: item.materialName,
      unit: item.unit,
      quantity: item.quantity,
      specifications: item.specifications,
      description: item.description,
      category: 'material',
      status: 'approved',
      approvedAt: new Date().toISOString()
    }));

    setFinalMaterials(prev => [...prev, ...approvedMaterials]);
    setUploadedMaterials([]);
    setShowMaterialTable(false);
    setUploadStatus(`✅ ${approvedMaterials.length} materials approved and added to project!`);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleApproveTools = () => {
    if (uploadedTools.length === 0) return;

    const approvedTools = uploadedTools.map(item => ({
      id: item.id,
      materialName: item.toolName,
      quantity: item.quantity,
      specifications: item.specifications,
      description: item.description,
      category: 'tool',
      status: 'approved',
      approvedAt: new Date().toISOString()
    }));

    setFinalTools(prev => [...prev, ...approvedTools]);
    setUploadedTools([]);
    setShowToolTable(false);
    setUploadStatus(`✅ ${approvedTools.length} tools approved and added to project!`);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Manual Add Functions
  const handleManualAdd = () => {
    if (!newItem.name.trim()) {
      setUploadStatus('❌ Please enter item name');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    const currentData = activeTab === 0 ? finalMaterials : finalTools;
    const setCurrentData = activeTab === 0 ? setFinalMaterials : setFinalTools;
    const category = activeTab === 0 ? 'material' : 'tool';

    // Check for duplicates
    if (currentData.some(item => 
      item.materialName.toLowerCase() === newItem.name.toLowerCase()
    )) {
      setUploadStatus(`❌ ${category === 'material' ? 'Material' : 'Tool'} already exists`);
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    const newItemData = {
      id: Date.now(),
      materialName: newItem.name,
      unit: newItem.unit || (category === 'material' ? 'Nos' : ''),
      quantity: Number(newItem.quantity) || 0,
      specifications: newItem.specifications || '',
      description: newItem.description || '',
      category: category,
      status: 'approved',
      addedManually: true,
      approvedAt: new Date().toISOString()
    };

    setCurrentData(prev => [...prev, newItemData]);
    setNewItem({
      name: '',
      unit: '',
      quantity: '',
      description: '',
      category: '',
      specifications: ''
    });
    setUploadStatus(`✅ ${category === 'material' ? 'Material' : 'Tool'} added successfully!`);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleRemoveItem = (id) => {
    if (activeTab === 0) {
      setFinalMaterials(prev => prev.filter(item => item.id !== id));
    } else {
      setFinalTools(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle Next
  const handleNext = () => {
    if (finalMaterials.length === 0 && finalTools.length === 0) {
      setUploadStatus('❌ Please add at least one material or tool before proceeding.');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }
    onComplete({ materials: finalMaterials, tools: finalTools });
    onNext();
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
        Stage 3: Material & Tool List
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Important:</strong> These materials and tools will be available in supervisor panels for requests.
      </Alert>

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

      {/* Material/Tool Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab 
            icon={<MaterialIcon />} 
            iconPosition="start"
            label={`Materials (${finalMaterials.length})`}
            sx={{ minHeight: '64px', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          />
          <Tab 
            icon={<ToolIcon />} 
            iconPosition="start"
            label={`Tools (${finalTools.length})`}
            sx={{ minHeight: '64px', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Upload Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {activeTab === 0 ? '📊 Upload Materials' : '🔧 Upload Tools'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {activeTab === 0 
                    ? 'Excel columns: SR.NO, MATERIAL NAME, UNIT, QUANTITY, SPECIFICATIONS, DESCRIPTION'
                    : 'Excel columns: SR.NO, TOOL NAME, QUANTITY, SPECIFICATIONS, DESCRIPTION'
                  }
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={isUploading ? <LinearProgress size={20} /> : <UploadIcon />}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Processing...' : 'Upload Excel/CSV'}
                    <input
                      type="file"
                      hidden
                      accept=".xlsx,.xls,.csv"
                      onChange={activeTab === 0 ? handleMaterialExcelUpload : handleToolExcelUpload}
                    />
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={activeTab === 0 ? downloadMaterialTemplate : downloadToolTemplate}
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
                  {activeTab === 0 ? finalMaterials.length : finalTools.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0 ? 'Materials' : 'Tools'} Added
                </Typography>
                {((activeTab === 0 && uploadedMaterials.length > 0) || (activeTab === 1 && uploadedTools.length > 0)) && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                    {activeTab === 0 ? uploadedMaterials.length : uploadedTools.length} items pending review
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>

          {/* Manual Add Section */}
          <Card sx={{ p: 3, mb: 4, backgroundColor: '#f0f7ff' }}>
            <Typography variant="h6" gutterBottom>
              ✍️ Manual Entry
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={activeTab === 0 ? 'Material Name' : 'Tool Name'}
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label={activeTab === 0 ? 'Unit' : 'Quantity'}
                  value={activeTab === 0 ? newItem.unit : newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    [activeTab === 0 ? 'unit' : 'quantity']: e.target.value 
                  }))}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleManualAdd}
                  size="large"
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Virtual Review Table for Materials */}
          {activeTab === 0 && showMaterialTable && uploadedMaterials.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#fff3e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  📋 Review Materials ({uploadedMaterials.length} items)
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={handleApproveMaterials}
                  color="success"
                  disabled={uploadedMaterials.length === 0}
                >
                  Approve All ({uploadedMaterials.length})
                </Button>
              </Box>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Please review the material data carefully.</strong> You can edit any field by clicking the edit icon.
              </Alert>

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>SR</strong></TableCell>
                      <TableCell><strong>MATERIAL NAME</strong></TableCell>
                      <TableCell><strong>UNIT</strong></TableCell>
                      <TableCell><strong>QUANTITY</strong></TableCell>
                      <TableCell><strong>SPECIFICATIONS</strong></TableCell>
                      <TableCell><strong>DESCRIPTION</strong></TableCell>
                      <TableCell><strong>ACTIONS</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadedMaterials.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.srNo}</TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.materialName || ''}
                              onChange={(e) => handleInputChange('materialName', e.target.value)}
                              fullWidth
                            />
                          ) : (
                            item.materialName
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.unit || ''}
                              onChange={(e) => handleInputChange('unit', e.target.value)}
                            />
                          ) : (
                            item.unit
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              type="number"
                              value={editData.quantity || ''}
                              onChange={(e) => handleInputChange('quantity', e.target.value)}
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.specifications || ''}
                              onChange={(e) => handleInputChange('specifications', e.target.value)}
                            />
                          ) : (
                            item.specifications || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.description || ''}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                          ) : (
                            item.description || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
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
                              <IconButton onClick={() => handleEdit(item, 'material')} color="primary" size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteRow(item.id, 'material')} color="error" size="small">
                                <Delete />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Virtual Review Table for Tools */}
          {activeTab === 1 && showToolTable && uploadedTools.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#fff3e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  🔧 Review Tools ({uploadedTools.length} items)
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={handleApproveTools}
                  color="success"
                  disabled={uploadedTools.length === 0}
                >
                  Approve All ({uploadedTools.length})
                </Button>
              </Box>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Please review the tool data carefully.</strong> You can edit any field by clicking the edit icon.
              </Alert>

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>SR</strong></TableCell>
                      <TableCell><strong>TOOL NAME</strong></TableCell>
                      <TableCell><strong>QUANTITY</strong></TableCell>
                      <TableCell><strong>SPECIFICATIONS</strong></TableCell>
                      <TableCell><strong>DESCRIPTION</strong></TableCell>
                      <TableCell><strong>ACTIONS</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadedTools.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.srNo}</TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.toolName || ''}
                              onChange={(e) => handleInputChange('toolName', e.target.value)}
                              fullWidth
                            />
                          ) : (
                            item.toolName
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              type="number"
                              value={editData.quantity || ''}
                              onChange={(e) => handleInputChange('quantity', e.target.value)}
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.specifications || ''}
                              onChange={(e) => handleInputChange('specifications', e.target.value)}
                            />
                          ) : (
                            item.specifications || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
                            <TextField
                              size="small"
                              value={editData.description || ''}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                          ) : (
                            item.description || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === item.id ? (
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
                              <IconButton onClick={() => handleEdit(item, 'tool')} color="primary" size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteRow(item.id, 'tool')} color="error" size="small">
                                <Delete />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Final Approved Items */}
          {((activeTab === 0 && finalMaterials.length > 0) || (activeTab === 1 && finalTools.length > 0)) && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  ✅ Approved {activeTab === 0 ? 'Materials' : 'Tools'} ({activeTab === 0 ? finalMaterials.length : finalTools.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPreviewDialog(true)}
                >
                  Preview List
                </Button>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>{activeTab === 0 ? finalMaterials.length : finalTools.length} {activeTab === 0 ? 'materials' : 'tools'}</strong> have been approved and will be available for supervisor requests.
              </Alert>

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{activeTab === 0 ? 'Material' : 'Tool'} Name</strong></TableCell>
                      <TableCell><strong>{activeTab === 0 ? 'Unit' : 'Quantity'}</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(activeTab === 0 ? finalMaterials : finalTools).map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activeTab === 0 ? <MaterialIcon color="primary" /> : <ToolIcon color="primary" />}
                            {item.materialName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {activeTab === 0 ? item.unit : item.quantity}
                        </TableCell>
                        <TableCell>
                          {item.description || item.specifications || '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => handleRemoveItem(item.id)} 
                            color="error" 
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                <Typography variant="h3" color="primary">
                  {finalMaterials.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Materials Added</Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
                <Typography variant="h3" color="secondary">
                  {finalTools.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Tools Added</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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
          disabled={finalMaterials.length === 0 && finalTools.length === 0}
          sx={{ minWidth: 200 }}
        >
          Next: Add Manpower ({finalMaterials.length + finalTools.length} items)
        </Button>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onClose={() => setShowPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{activeTab === 0 ? 'Materials' : 'Tools'} Preview</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>{activeTab === 0 ? 'Unit' : 'Quantity'}</strong></TableCell>
                  <TableCell><strong>Specifications</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeTab === 0 ? finalMaterials : finalTools).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{activeTab === 0 ? item.unit : item.quantity}</TableCell>
                    <TableCell>{item.specifications || '-'}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
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

export default ToolsStage;