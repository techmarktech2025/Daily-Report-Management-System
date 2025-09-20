// src/Pages/Supervisor/MaterialToolRequest/MaterialToolRequest.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Fade
} from '@mui/material';
import {
  Build as ToolIcon,
  Inventory as MaterialIcon,
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  LocalShipping as MappedIcon,
  Edit as CustomIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const MaterialToolRequest = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0 = Material, 1 = Tool
  const [formData, setFormData] = useState({
    materialName: '',
    customName: '', // For "Other" option
    quantity: '',
    size: '',
    specification: '',
    priority: '',
    areaInUse: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [projectTools, setProjectTools] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Mock project data - this would come from the assigned project's scope of work
  const mockProjectData = {
    materials: [
      'Cement',
      'Steel Rods',
      'Bricks',
      'Sand',
      'Aggregates',
      'Aluminium Frames', // From scope of work: ALUMINIUM FRAMING
      'Glass Panels',     // From scope of work: GLASS REMOVING/REFIXING
      'ACP Sheets',       // From scope of work: ACP SHEET FIXING
      'GI Sheets',        // From scope of work: GI SHEET
      'Silicon',          // From scope of work: SILICON
      'Membrane',         // From scope of work: MAMBREN
      'Insulation Material', // From scope of work: INSULATION FIXING
      'Clips',           // From scope of work: CLIP REMOVING
      'GI Trays',        // From scope of work: GI TRAY FIXING
      'Paints',
      'Hardware Items'
    ],
    tools: [
      'Drill Machine',
      'Angle Grinder',
      'Glass Cutting Tools',    // For glass work
      'Frame Installation Tools', // For aluminium framing
      'Welding Equipment',       // For GI work
      'Silicon Gun',            // For silicon application
      'Measuring Tools',
      'Safety Equipment',
      'Scaffolding',
      'Ladder',
      'Lifting Equipment',
      'Cutting Tools',
      'Installation Kit',
      'Compressor',
      'Hand Tools Set'
    ]
  };

  // Priority options
  const priorityOptions = ['High', 'Medium', 'Low'];

  // Mock requests data
  const mockRequests = [
    {
      id: 1,
      type: 'Material',
      materialName: 'Aluminium Frames',
      customName: null,
      quantity: 20,
      size: '1200mm x 800mm',
      specification: 'Powder coated, white color, with rubber gaskets',
      priority: 'High',
      areaInUse: 'Ground Floor - East Wing window installation',
      status: 'Approved',
      requestedBy: 'Rajesh Kumar',
      requestDate: '2025-08-29T10:30:00',
      approvedDate: '2025-08-30T14:15:00'
    },
    {
      id: 2,
      type: 'Tool',
      materialName: 'Glass Cutting Tools',
      customName: null,
      quantity: 1,
      size: 'Professional grade',
      specification: 'Diamond blade glass cutter with oil reservoir',
      priority: 'Medium',
      areaInUse: 'First Floor - Custom glass cutting for windows',
      status: 'Pending',
      requestedBy: 'Rajesh Kumar',
      requestDate: '2025-08-30T09:20:00'
    },
    {
      id: 3,
      type: 'Material',
      materialName: 'Other',
      customName: 'Weather Stripping',
      quantity: 50,
      size: '10mm x 5mm',
      specification: 'EPDM rubber, black color, self-adhesive',
      priority: 'Low',
      areaInUse: 'All floors - Window sealing work',
      status: 'Mapped',
      requestedBy: 'Rajesh Kumar',
      requestDate: '2025-08-28T15:45:00',
      approvedDate: '2025-08-29T11:30:00',
      mappedDate: '2025-08-30T16:00:00'
    }
  ];

  useEffect(() => {
    loadProjectData();
    setRequests(mockRequests);
  }, []);

  const loadProjectData = () => {
    // In real implementation, this would fetch from the assigned project's scope of work
    setProjectMaterials(mockProjectData.materials);
    setProjectTools(mockProjectData.tools);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset form when switching tabs
    setFormData({
      materialName: '',
      customName: '',
      quantity: '',
      size: '',
      specification: '',
      priority: '',
      areaInUse: ''
    });
    setShowCustomInput(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show/hide custom input based on selection
    if (name === 'materialName') {
      setShowCustomInput(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, customName: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['materialName', 'quantity', 'size', 'specification', 'priority', 'areaInUse'];
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        setSubmitStatus(`❌ Please fill in ${fieldName}`);
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
    }

    // Validate custom name if "Other" is selected
    if (formData.materialName === 'Other' && !formData.customName.trim()) {
      setSubmitStatus(`❌ Please specify the custom ${activeTab === 0 ? 'material' : 'tool'} name`);
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    // Quantity validation
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      setSubmitStatus('❌ Please enter a valid quantity');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('💾 Submitting request...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest = {
        id: requests.length + 1,
        type: activeTab === 0 ? 'Material' : 'Tool',
        materialName: formData.materialName,
        customName: formData.materialName === 'Other' ? formData.customName : null,
        quantity: parseInt(formData.quantity),
        size: formData.size,
        specification: formData.specification,
        priority: formData.priority,
        areaInUse: formData.areaInUse,
        status: 'Pending',
        requestedBy: user?.name || 'Supervisor',
        requestDate: new Date().toISOString()
      };

      setRequests(prev => [newRequest, ...prev]);

      // Reset form
      setFormData({
        materialName: '',
        customName: '',
        quantity: '',
        size: '',
        specification: '',
        priority: '',
        areaInUse: ''
      });
      setShowCustomInput(false);

      setSubmitStatus(`✅ ${activeTab === 0 ? 'Material' : 'Tool'} request submitted successfully! Status: Pending`);
      setTimeout(() => setSubmitStatus(''), 5000);

    } catch (error) {
      setSubmitStatus('❌ Failed to submit request. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <ApprovedIcon sx={{ color: 'success.main' }} />;
      case 'Pending': return <PendingIcon sx={{ color: 'warning.main' }} />;
      case 'Rejected': return <RejectedIcon sx={{ color: 'error.main' }} />;
      case 'Mapped': return <MappedIcon sx={{ color: 'info.main' }} />;
      default: return <PendingIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';  
      case 'Rejected': return 'error';
      case 'Mapped': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  // Get display name for the request (handle custom names)
  const getDisplayName = (request) => {
    if (request.materialName === 'Other' && request.customName) {
      return `${request.customName} (Custom)`;
    }
    return request.materialName;
  };

  // Filter requests by current tab
  const filteredRequests = requests.filter(req => 
    req.type === (activeTab === 0 ? 'Material' : 'Tool')
  );

  // Calculate summary
  const summary = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'Pending').length,
    approved: filteredRequests.filter(r => r.status === 'Approved').length,
    rejected: filteredRequests.filter(r => r.status === 'Rejected').length,
    mapped: filteredRequests.filter(r => r.status === 'Mapped').length
  };

  // Get options based on active tab
  const currentOptions = activeTab === 0 ? projectMaterials : projectTools;
  const currentType = activeTab === 0 ? 'Material' : 'Tool';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 4 }}>
        Material & Tool Request
      </Typography>

      {/* Project Info */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Project:</strong> {user?.assignedProjects?.[0]?.name || 'Current Project'} | 
          <strong> Available {currentType}s:</strong> {currentOptions.length} from project scope + Custom option
        </Typography>
      </Alert>

      {/* Toggle Tabs */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              minHeight: '60px',
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          <Tab 
            icon={<MaterialIcon />} 
            iconPosition="start"
            label="Material"
            sx={{ 
              backgroundColor: activeTab === 0 ? '#1976d2' : 'transparent',
              color: activeTab === 0 ? 'white' : 'inherit',
              borderRadius: '8px 0 0 8px'
            }}
          />
          <Tab 
            icon={<ToolIcon />} 
            iconPosition="start"
            label="Tools"
            sx={{ 
              backgroundColor: activeTab === 1 ? '#1976d2' : 'transparent',
              color: activeTab === 1 ? 'white' : 'inherit',
              borderRadius: '0 8px 8px 0'
            }}
          />
        </Tabs>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {summary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total {currentType}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {summary.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {summary.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {summary.mapped}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mapped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        
        {/* Request Form */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {activeTab === 0 ? <MaterialIcon sx={{ mr: 2, color: 'primary.main' }} /> : <ToolIcon sx={{ mr: 2, color: 'primary.main' }} />}
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Request {currentType}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Material/Tool Name */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    {currentType} Name
                  </Typography>
                  <TextField
                    name="materialName"
                    select
                    value={formData.materialName}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder={`Select ${currentType.toLowerCase()}`}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        minHeight: '56px', 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  >
                    {/* Project-based options */}
                    {currentOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                    {/* Other option */}
                    <MenuItem value="Other" sx={{ borderTop: '1px solid #eee', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CustomIcon sx={{ mr: 1, fontSize: 18 }} />
                        Other (Custom {currentType})
                      </Box>
                    </MenuItem>
                  </TextField>
                </Box>

                {/* Custom Name Input (shown when "Other" is selected) */}
                {showCustomInput && (
                  <Fade in={showCustomInput}>
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                        Custom {currentType} Name
                      </Typography>
                      <TextField
                        name="customName"
                        value={formData.customName}
                        onChange={handleInputChange}
                        placeholder={`Enter the name of the custom ${currentType.toLowerCase()}`}
                        fullWidth
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            minHeight: '56px', 
                            backgroundColor: '#fff3e0',
                            borderColor: '#ff9800',
                            '&:hover': { backgroundColor: '#fff8e1' }
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        This custom {currentType.toLowerCase()} will be added to the project list after admin approval
                      </Typography>
                    </Box>
                  </Fade>
                )}

                {/* Quantity and Specification */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                      Quantity
                    </Typography>
                    <TextField
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      fullWidth
                      variant="outlined"
                      inputProps={{ min: 1 }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          minHeight: '56px', 
                          backgroundColor: '#fafafa',
                          '&:hover': { backgroundColor: 'white' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                      Specification
                    </Typography>
                    <TextField
                      name="specification"
                      value={formData.specification}
                      onChange={handleInputChange}
                      placeholder="Enter specification details"
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          minHeight: '56px', 
                          backgroundColor: '#fafafa',
                          '&:hover': { backgroundColor: 'white' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Size */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Size
                  </Typography>
                  <TextField
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="Enter size/dimensions"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        minHeight: '56px', 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 1.5,
                        '&:hover': { borderColor: '#1976d2' }
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      Add more size options
                    </Typography>
                  </Box>
                </Box>

                {/* Priority */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Priority
                  </Typography>
                  <TextField
                    name="priority"
                    select
                    value={formData.priority}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        minHeight: '56px', 
                        backgroundColor: '#fafafa'
                      }
                    }}
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Area in Use */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Area in use
                  </Typography>
                  <TextField
                    name="areaInUse"
                    value={formData.areaInUse}
                    onChange={handleInputChange}
                    placeholder="Describe where this material/tool will be used"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Status Message */}
                {submitStatus && (
                  <Alert 
                    severity={
                      submitStatus.includes('✅') ? 'success' : 
                      submitStatus.includes('💾') ? 'info' : 'error'
                    }
                  >
                    {submitStatus}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: '#2196f3',
                    minHeight: '56px'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>

              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Request History */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              {currentType} Requests ({filteredRequests.length})
            </Typography>
            
            <List>
              {filteredRequests.map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getStatusIcon(request.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {getDisplayName(request)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip 
                              label={request.priority} 
                              color={getPriorityColor(request.priority)}
                              size="small"
                            />
                            <Chip 
                              label={request.status} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Qty:</strong> {request.quantity} | <strong>Size:</strong> {request.size}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Spec:</strong> {request.specification}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Area:</strong> {request.areaInUse.substring(0, 50)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </Typography>
                          {request.customName && (
                            <Typography variant="caption" color="warning.main" display="block">
                              Custom {currentType}: {request.customName}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredRequests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {filteredRequests.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No {currentType.toLowerCase()} requests yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Submit your first {currentType.toLowerCase()} request using the form
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default MaterialToolRequest;
