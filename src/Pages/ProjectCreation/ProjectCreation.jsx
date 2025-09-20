import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  FormControl,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Info as InfoIcon,
  Assignment as ScopeIcon,
  Inventory as MaterialIcon,
  People as ManpowerIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Build as ToolsIcon
} from '@mui/icons-material';

// Updated steps - removed the redundant "Tools at Site" step
const steps = [
  { label: 'Project Details', icon: InfoIcon, description: 'Basic project information' },
  { label: 'Scope of Work', icon: ScopeIcon, description: 'Upload and manage work scope' },
  { label: 'Material & Tool List', icon: MaterialIcon, description: 'Define project materials and tools' },
  { label: 'Add Manpower', icon: ManpowerIcon, description: 'Assign supervisors and employees' }
];

// Sample data
const sampleScopeData = [
  { id: 1, scopeOfWork: 'ALUMINIUM FRAMING', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 2, scopeOfWork: 'GI SHEET', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 3, scopeOfWork: 'MAMBREN', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 4, scopeOfWork: 'ACP SHEET FIXING', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 5, scopeOfWork: 'SILICON', east: 51, west: 28, north: 116, south: 91, total: 286, unit: 'NOS.' },
  { id: 6, scopeOfWork: 'GLASS REMOVING', east: 0, west: 180, north: 0, south: 0, total: 180, unit: 'NOS.' }
];

const availableSupervisors = [
  { id: 1, name: 'Robert Johnson', employeeId: 'SUP001', department: 'Operations' },
  { id: 2, name: 'Sarah Brown', employeeId: 'SUP002', department: 'Materials' },
  { id: 3, name: 'Mike Wilson', employeeId: 'SUP003', department: 'Quality' }
];

const availableEmployees = [
  { id: 1, name: 'John Doe', employeeId: 'EMP001', role: 'Site Engineer', department: 'Construction' },
  { id: 2, name: 'Jane Smith', employeeId: 'EMP002', role: 'Project Manager', department: 'Management' },
  { id: 3, name: 'Emily Davis', employeeId: 'EMP003', role: 'Quality Inspector', department: 'Quality Control' },
  { id: 4, name: 'David Martinez', employeeId: 'EMP005', role: 'Electrician', department: 'Electrical' }
];

// Stage 1: Project Details
const ProjectDetailsStage = ({ data, onComplete, onNext }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    jobNo: '',
    orderNo: '',
    dateOfCompletion: '',
    ...data
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
    onNext();
  };

  const isFormValid = formData.projectName && formData.jobNo && formData.orderNo && formData.dateOfCompletion;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Stage 1: Project Details
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>Project Name</Typography>
            <TextField
              fullWidth name="projectName" value={formData.projectName} onChange={handleChange}
              placeholder="Enter project name" required variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>Job No</Typography>
            <TextField
              fullWidth name="jobNo" value={formData.jobNo} onChange={handleChange}
              placeholder="Enter job number" required variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>Order No</Typography>
            <TextField
              fullWidth name="orderNo" value={formData.orderNo} onChange={handleChange}
              placeholder="Enter order number" required variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>Date of Completion</Typography>
            <TextField
              fullWidth name="dateOfCompletion" type="date" value={formData.dateOfCompletion}
              onChange={handleChange} required variant="outlined" InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={!isFormValid}
                sx={{ minHeight: '56px', fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', px: 5 }}>
                Next: Scope of Work
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// Stage 2: Scope of Work
const ScopeOfWorkStage = ({ data, onComplete, onNext, onBack }) => {
  const [scopeData, setScopeData] = useState(data?.length > 0 ? data : []);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
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

    setScopeData(prev => prev.map(item => item.id === editingId ? updatedData : item));
    setEditingId(null);
    setEditData({});
  };

  const handleNext = () => {
    onComplete(scopeData);
    onNext();
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Stage 2: Scope of Work
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Scope of work:</Typography>
              <Button variant="contained" component="label" startIcon={<UploadIcon />}
                sx={{ backgroundColor: '#000', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
                Upload
                <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary">CSV/XLSX file</Typography>
            {uploadStatus && <Alert severity={uploadStatus.includes('success') ? 'success' : 'info'} sx={{ mt: 2 }}>{uploadStatus}</Alert>}
          </Card>
        </Grid>
      </Grid>

      {scopeData.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                {['SCOPE OF WORK', 'EAST', 'WEST', 'NORTH', 'SOUTH', 'TOTAL', 'UNIT', 'ACTIONS'].map(header => (
                  <TableCell key={header} sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {scopeData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {editingId === row.id ? (
                      <TextField size="small" value={editData.scopeOfWork || ''} 
                        onChange={(e) => setEditData(prev => ({ ...prev, scopeOfWork: e.target.value }))} />
                    ) : row.scopeOfWork}
                  </TableCell>
                  {['east', 'west', 'north', 'south'].map(direction => (
                    <TableCell key={direction} align="center">
                      {editingId === row.id ? (
                        <TextField size="small" type="number" value={editData[direction] || 0}
                          onChange={(e) => setEditData(prev => ({ ...prev, [direction]: e.target.value }))} sx={{ width: 70 }} />
                      ) : (row[direction] || '-')}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {editingId === row.id 
                        ? (Number(editData.east) || 0) + (Number(editData.west) || 0) + (Number(editData.north) || 0) + (Number(editData.south) || 0)
                        : row.total}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{row.unit}</TableCell>
                  <TableCell>
                    {editingId === row.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={handleSaveEdit} color="primary"><SaveIcon /></IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}><CancelIcon /></IconButton>
                      </Box>
                    ) : (
                      <IconButton size="small" onClick={() => handleEdit(row)} color="primary"><EditIcon /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="outlined" onClick={onBack} sx={{ minHeight: '56px', px: 4 }}>Back</Button>
        <Button variant="contained" onClick={handleNext} disabled={scopeData.length === 0}
          sx={{ minHeight: '56px', px: 4 }}>Next: Material & Tool List</Button>
      </Box>
    </Paper>
  );
};

// Stage 3: Material & Tool List with Excel Upload
const MaterialToolListStage = ({ data, onComplete, onNext, onBack }) => {
  const [materialTab, setMaterialTab] = useState(0); // 0 = Materials, 1 = Tools
  const [projectMaterials, setProjectMaterials] = useState(data?.materials || []);
  const [projectTools, setProjectTools] = useState(data?.tools || []);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [uploadedTools, setUploadedTools] = useState([]);
  const [showMaterialTable, setShowMaterialTable] = useState(false);
  const [showToolTable, setShowToolTable] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [newMaterial, setNewMaterial] = useState({
    materialName: '',
    unit: '',
    description: ''
  });

  // Excel Upload Handler for Materials
  const handleMaterialExcelUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Processing Excel file...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        const processedMaterials = jsonData.slice(1).map((row, index) => {
          if (row.length >= 5) { // Ensure minimum columns exist
            return {
              id: Date.now() + index,
              srNo: row[0] || index + 1,
              description: row[1] || '',
              width: row[2] || '',
              length: row[3] || '',
              qty: row[4] || 0,
              unit: row[5] || 'Nos',
              category: 'material'
            };
          }
          return null;
        }).filter(Boolean);
        
        setUploadedMaterials(processedMaterials);
        setShowMaterialTable(true);
        setUploadStatus(`✅ ${processedMaterials.length} materials loaded from Excel`);
        setTimeout(() => setUploadStatus(''), 3000);
        
      } catch (error) {
        setUploadStatus('❌ Error processing Excel file. Please check format.');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset file input
  }, []);

  // Excel Upload Handler for Tools
  const handleToolExcelUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Processing Excel file...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        const processedTools = jsonData.slice(1).map((row, index) => {
          if (row.length >= 2) { // Ensure minimum columns exist
            return {
              id: Date.now() + index,
              toolName: row[0] || '',
              quantity: row[1] || 0,
              description: row[2] || '',
              category: 'tool'
            };
          }
          return null;
        }).filter(Boolean);
        
        setUploadedTools(processedTools);
        setShowToolTable(true);
        setUploadStatus(`✅ ${processedTools.length} tools loaded from Excel`);
        setTimeout(() => setUploadStatus(''), 3000);
        
      } catch (error) {
        setUploadStatus('❌ Error processing Excel file. Please check format.');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset file input
  }, []);

  // Handle Material Edit
  const handleMaterialEdit = (id, field, value) => {
    setUploadedMaterials(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle Tool Edit
  const handleToolEdit = (id, field, value) => {
    setUploadedTools(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Delete Material Row
  const deleteMaterialRow = (id) => {
    setUploadedMaterials(prev => prev.filter(item => item.id !== id));
  };

  // Delete Tool Row
  const deleteToolRow = (id) => {
    setUploadedTools(prev => prev.filter(item => item.id !== id));
  };

  // Approve Materials
  const approveMaterials = () => {
    const newMaterials = uploadedMaterials.map(item => ({
      id: item.id,
      materialName: item.description,
      width: item.width,
      length: item.length,
      quantity: item.qty,
      unit: item.unit,
      category: 'material'
    }));
    
    setProjectMaterials(prev => [...prev, ...newMaterials]);
    setUploadedMaterials([]);
    setShowMaterialTable(false);
    setUploadStatus('✅ Materials added to project list');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Approve Tools
  const approveTools = () => {
    const newTools = uploadedTools.map(item => ({
      id: item.id,
      materialName: item.toolName,
      quantity: item.quantity,
      description: item.description,
      category: 'tool'
    }));
    
    setProjectTools(prev => [...prev, ...newTools]);
    setUploadedTools([]);
    setShowToolTable(false);
    setUploadStatus('✅ Tools added to project list');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Manual Add Material
  const handleMaterialChange = (e) => {
    setNewMaterial({
      ...newMaterial,
      [e.target.name]: e.target.value
    });
  };

  const addMaterial = () => {
    if (!newMaterial.materialName || !newMaterial.unit) {
      alert('Please fill in material name and unit');
      return;
    }

    const currentList = materialTab === 0 ? projectMaterials : projectTools;
    const setCurrentList = materialTab === 0 ? setProjectMaterials : setProjectTools;
    const category = materialTab === 0 ? 'material' : 'tool';

    if (currentList.some(item => item.materialName.toLowerCase() === newMaterial.materialName.toLowerCase())) {
      alert(`${category === 'material' ? 'Material' : 'Tool'} already exists`);
      return;
    }

    const materialItem = {
      id: Date.now(),
      materialName: newMaterial.materialName,
      category: category,
      unit: newMaterial.unit,
      description: newMaterial.description || ''
    };

    setCurrentList([...currentList, materialItem]);
    setNewMaterial({
      materialName: '',
      unit: '',
      description: ''
    });
  };

  const removeMaterial = (id) => {
    if (materialTab === 0) {
      setProjectMaterials(projectMaterials.filter(item => item.id !== id));
    } else {
      setProjectTools(projectTools.filter(item => item.id !== id));
    }
  };

  const handleNext = () => {
    onComplete({ materials: projectMaterials, tools: projectTools });
    onNext();
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Stage 3: Material & Tool List
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Upload Excel files or manually add materials and tools for this project
      </Typography>

      {/* Upload Status */}
      {uploadStatus && (
        <Alert 
          severity={uploadStatus.includes('✅') ? 'success' : uploadStatus.includes('❌') ? 'error' : 'info'} 
          sx={{ mb: 3 }}
        >
          {uploadStatus}
        </Alert>
      )}

      {/* Material/Tool Tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs value={materialTab} onChange={(e, v) => setMaterialTab(v)}>
          <Tab 
            icon={<MaterialIcon />} 
            iconPosition="start"
            label={`Materials (${projectMaterials.length})`}
            sx={{ minHeight: '64px', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          />
          <Tab 
            icon={<ToolsIcon />} 
            iconPosition="start"
            label={`Tools (${projectTools.length})`}
            sx={{ minHeight: '64px', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* Excel Upload Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              📊 Excel Upload
            </Typography>
            
            <Button
              variant="contained"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ 
                minHeight: '56px', 
                mb: 2,
                backgroundColor: '#2e7d32',
                '&:hover': { backgroundColor: '#1b5e20' }
              }}
            >
              Upload {materialTab === 0 ? 'Materials' : 'Tools'} Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={materialTab === 0 ? handleMaterialExcelUpload : handleToolExcelUpload}
              />
            </Button>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {materialTab === 0 
                ? 'Excel columns: SR.NO | DESCRIPTION | Width | Length | QTY | UNIT'
                : 'Excel columns: Tool Name | Quantity | Description'
              }
            </Typography>

            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <strong>Supported formats:</strong> .xlsx, .xls, .csv
            </Alert>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
              ✍️ Manual Entry
            </Typography>
            
            <TextField
              fullWidth
              name="materialName"
              value={newMaterial.materialName}
              onChange={handleMaterialChange}
              placeholder={materialTab === 0 ? 'Material Description' : 'Tool Name'}
              variant="outlined"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { minHeight: '48px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="unit"
                  value={newMaterial.unit}
                  onChange={handleMaterialChange}
                  placeholder="Unit"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '48px' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={addMaterial}
                  sx={{ minHeight: '48px' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Virtual Table for Uploaded Materials */}
      {materialTab === 0 && showMaterialTable && uploadedMaterials.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              📋 Review Materials ({uploadedMaterials.length} items)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="success" onClick={approveMaterials}>
                ✅ Approve All
              </Button>
              <Button variant="outlined" color="error" onClick={() => setShowMaterialTable(false)}>
                ❌ Cancel
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>SR</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd', minWidth: 200 }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>WIDTH</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>LENGTH</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>QTY</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>UNIT</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3f2fd' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedMaterials.map((row, index) => (
                  <TableRow key={row.id} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                    <TableCell>{row.srNo}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.description}
                        onChange={(e) => handleMaterialEdit(row.id, 'description', e.target.value)}
                        multiline
                        maxRows={2}
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.width}
                        onChange={(e) => handleMaterialEdit(row.id, 'width', e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.length}
                        onChange={(e) => handleMaterialEdit(row.id, 'length', e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={(e) => handleMaterialEdit(row.id, 'qty', e.target.value)}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.unit}
                        onChange={(e) => handleMaterialEdit(row.id, 'unit', e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => deleteMaterialRow(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Virtual Table for Uploaded Tools */}
      {materialTab === 1 && showToolTable && uploadedTools.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
              🔧 Review Tools ({uploadedTools.length} items)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="success" onClick={approveTools}>
                ✅ Approve All
              </Button>
              <Button variant="outlined" color="error" onClick={() => setShowToolTable(false)}>
                ❌ Cancel
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f3e5f5', minWidth: 200 }}>TOOL NAME</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f3e5f5' }}>QUANTITY</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f3e5f5', minWidth: 250 }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f3e5f5' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedTools.map((row, index) => (
                  <TableRow key={row.id} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.toolName}
                        onChange={(e) => handleToolEdit(row.id, 'toolName', e.target.value)}
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.quantity}
                        onChange={(e) => handleToolEdit(row.id, 'quantity', e.target.value)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.description}
                        onChange={(e) => handleToolEdit(row.id, 'description', e.target.value)}
                        multiline
                        maxRows={2}
                        sx={{ minWidth: 250 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => deleteToolRow(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Final Materials/Tools List */}
      {((materialTab === 0 && projectMaterials.length > 0) || (materialTab === 1 && projectTools.length > 0)) && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  {materialTab === 0 ? 'Material' : 'Tool'} Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  {materialTab === 0 ? 'Specifications' : 'Quantity'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>
                  {materialTab === 0 ? 'Unit' : 'Description'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#1976d2', color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(materialTab === 0 ? projectMaterials : projectTools).map((item, index) => (
                <TableRow key={item.id} sx={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {materialTab === 0 ? 
                        <MaterialIcon sx={{ mr: 1, color: 'primary.main' }} /> : 
                        <ToolsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      }
                      <Typography sx={{ fontWeight: 500 }}>{item.materialName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {materialTab === 0 ? (
                      item.width && item.length ? `${item.width} x ${item.length}` : '-'
                    ) : (
                      item.quantity || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {materialTab === 0 ? (
                      <Chip label={item.unit} color="primary" size="small" variant="outlined" />
                    ) : (
                      item.description || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeMaterial(item.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Card variant="outlined" sx={{ p: 3, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <MaterialIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {projectMaterials.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">Materials Added</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined" sx={{ p: 3, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
            <ToolsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {projectTools.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">Tools Added</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Excel Upload Instructions:</strong><br/>
          • <strong>Materials:</strong> Columns should be SR.NO, DESCRIPTION, Width, Length, QTY, UNIT<br/>
          • <strong>Tools:</strong> Columns should be Tool Name, Quantity, Description<br/>
          • Review data in the virtual table before approving<br/>
          • These items will be available for supervisor material requests
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="outlined" onClick={onBack} sx={{ minHeight: '56px', px: 4 }}>Back</Button>
        <Button 
          variant="contained" 
          onClick={handleNext} 
          disabled={projectMaterials.length === 0 && projectTools.length === 0}
          sx={{ minHeight: '56px', px: 4 }}
        >
          Next: Add Manpower
        </Button>
      </Box>
    </Paper>
  );
};

// Stage 4: Manpower (Final Step)
const ManpowerStage = ({ data, onComplete, onProjectComplete, onBack }) => {
  const [selectedSupervisors, setSelectedSupervisors] = useState(data?.supervisors || []);
  const [selectedEmployees, setSelectedEmployees] = useState(data?.employees || []);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const handleAddSupervisor = (supervisor) => {
    if (!selectedSupervisors.find(s => s.id === supervisor.id)) {
      setSelectedSupervisors(prev => [...prev, supervisor]);
    }
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(prev => prev.filter(s => s.id !== supervisorId));
  };

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const filteredEmployees = availableEmployees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const handleCompleteProject = () => {
    onComplete({ supervisors: selectedSupervisors, employees: selectedEmployees });
    onProjectComplete();
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Stage 4: Add Manpower
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Supervisors
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select value="" displayEmpty
                onChange={(e) => {
                  const supervisor = availableSupervisors.find(s => s.id === e.target.value);
                  if (supervisor) handleAddSupervisor(supervisor);
                }}
                sx={{ minHeight: '56px' }}>
                <MenuItem value="" disabled>Select Supervisor</MenuItem>
                {availableSupervisors
                  .filter(supervisor => !selectedSupervisors.find(s => s.id === supervisor.id))
                  .map((supervisor) => (
                    <MenuItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.employeeId})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Selected Supervisors ({selectedSupervisors.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '60px' }}>
              {selectedSupervisors.map((supervisor) => (
                <Chip key={supervisor.id} label={`${supervisor.name} (${supervisor.employeeId})`}
                  onDelete={() => handleRemoveSupervisor(supervisor.id)} color="primary" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Filter Employees
            </Typography>
            
            <TextField fullWidth placeholder="Search employees..." value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ mb: 3 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Available Employees:</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.find(e => e.id === employee.id);
                return (
                  <ListItem key={employee.id} button onClick={() => !isSelected && handleAddEmployee(employee)}
                    sx={{ opacity: isSelected ? 0.5 : 1, cursor: isSelected ? 'not-allowed' : 'pointer' }}>
                    <ListItemText primary={employee.name} 
                      secondary={`${employee.employeeId} - ${employee.role}`} />
                    {isSelected && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveEmployee(employee.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>
              Selected Team ({selectedEmployees.length} employees)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '60px' }}>
              {selectedEmployees.map((employee) => (
                <Chip key={employee.id} label={`${employee.name} - ${employee.role}`}
                  onDelete={() => handleRemoveEmployee(employee.id)} color="secondary" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} sx={{ minHeight: '56px', px: 4 }}>Back</Button>
        <Button 
          variant="contained" 
          onClick={handleCompleteProject} 
          disabled={selectedSupervisors.length === 0}
          sx={{ 
            minHeight: '56px', 
            px: 4, 
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

// Main Project Creation Component
const ProjectCreation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    projectDetails: {},
    scopeOfWork: [],
    materialToolList: { materials: [], tools: [] },
    manpower: { supervisors: [], employees: [] }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('projectDraft', JSON.stringify(projectData));
    setSnackbar({ open: true, message: 'Draft saved successfully!', severity: 'success' });
  };

  const handleStageComplete = (stageData) => {
    const stageKeys = ['projectDetails', 'scopeOfWork', 'materialToolList', 'manpower'];
    setProjectData(prev => ({ ...prev, [stageKeys[activeStep]]: stageData }));
  };

  const handleProjectComplete = () => {
    console.log('Project completed:', projectData);
    setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
  };

  const isStepCompleted = (step) => {
    const stageKeys = ['projectDetails', 'scopeOfWork', 'materialToolList', 'manpower'];
    const stageData = projectData[stageKeys[step]];
    
    switch (step) {
      case 0: return stageData?.projectName && stageData?.jobNo;
      case 1: return Array.isArray(stageData) && stageData.length > 0;
      case 2: return stageData?.materials?.length > 0 || stageData?.tools?.length > 0;
      case 3: return stageData?.supervisors?.length > 0;
      default: return false;
    }
  };

  const getCurrentStageComponent = () => {
    switch (activeStep) {
      case 0: return <ProjectDetailsStage data={projectData.projectDetails} onComplete={handleStageComplete} onNext={handleNext} />;
      case 1: return <ScopeOfWorkStage data={projectData.scopeOfWork} onComplete={handleStageComplete} onNext={handleNext} onBack={handleBack} />;
      case 2: return <MaterialToolListStage data={projectData.materialToolList} onComplete={handleStageComplete} onNext={handleNext} onBack={handleBack} />;
      case 3: return <ManpowerStage data={projectData.manpower} onComplete={handleStageComplete} onProjectComplete={handleProjectComplete} onBack={handleBack} />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Typography variant="h3" component="h1"
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, fontWeight: 600, color: '#1976d2', mb: 2 }}>
          Create New Project
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" onClick={handleSaveDraft}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 2, sm: 3 } }}>
            Save as Draft
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 } }}>
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'}>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Step key={step.label} completed={isStepCompleted(index)}>
                <StepLabel StepIconComponent={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40,
                    borderRadius: '50%', color: 'white',
                    backgroundColor: index === activeStep ? 'primary.main' : isStepCompleted(index) ? 'success.main' : 'grey.300' }}>
                    <StepIcon sx={{ fontSize: 20 }} />
                  </Box>
                )}>
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: index === activeStep ? 600 : 400 }}>
                    {step.label}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {step.description}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      <Box>{getCurrentStageComponent()}</Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectCreation;
