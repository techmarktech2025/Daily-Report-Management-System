// src/Pages/Supervisor/MaterialToolRequest/MaterialToolRequestUpdated.jsx
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
  Edit as CustomIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useProject } from '../../../src/contexts/ProjectContext';

const MaterialToolRequest = () => {
  const { user } = useAuth();
  const { getProjectBySupervisor, needsConfirmation } = useProject();
  
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
  const [project, setProject] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState('checking');

  // Priority options
  const priorityOptions = ['High', 'Medium', 'Low'];

  useEffect(() => {
    loadProjectAndCheckAuth();
  }, [user]);

  useEffect(() => {
    if (project) {
      loadRequestHistory();
    }
  }, [project]);

  const loadProjectAndCheckAuth = async () => {
    if (user && user.employeeId) {
      const userProject = getProjectBySupervisor(user.employeeId);
      
      if (userProject) {
        setProject(userProject);
        
        // Check if supervisor needs confirmation
        const needsAuth = needsConfirmation(userProject.id, user.employeeId);
        setAuthorizationStatus(needsAuth ? 'needs_confirmation' : 'authorized');
      } else {
        setAuthorizationStatus('no_project');
      }
    }
  };

  const loadRequestHistory = () => {
    // Load requests from localStorage for this project
    const storedRequests = localStorage.getItem(`requests_${project.id}`);
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    }
  };

  const saveRequestHistory = (updatedRequests) => {
    localStorage.setItem(`requests_${project.id}`, JSON.stringify(updatedRequests));
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
        requestDate: new Date().toISOString(),
        projectId: project.id,
        projectName: project.projectName
      };

      const updatedRequests = [newRequest, ...requests];
      setRequests(updatedRequests);
      saveRequestHistory(updatedRequests);

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
      case 'Approved': return <ApprovedIcon color="success" />;
      case 'Pending': return <PendingIcon color="warning" />;
      case 'Rejected': return <RejectedIcon color="error" />;
      case 'Mapped': return <MappedIcon color="info" />;
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

  // Get options based on active tab (from project data)
  const currentOptions = activeTab === 0 
    ? (project?.materials || []).map(m => m.materialName)
    : (project?.tools || []).map(t => t.materialName);
  
  const currentType = activeTab === 0 ? 'Material' : 'Tool';

  // Handle unauthorized access
  if (authorizationStatus === 'checking') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Checking authorization...</Typography>
      </Container>
    );
  }

  if (authorizationStatus === 'needs_confirmation') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6">Authorization Required</Typography>
          <Typography>
            You need to complete the supervisor confirmation process before accessing this feature.
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

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Material & Tool Request
      </Typography>

      {/* Project Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Project:</strong> {project?.projectName} | 
        <strong> Available {currentType}s:</strong> {currentOptions.length} from project scope + Custom option
      </Alert>

      {/* Toggle Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
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
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {summary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total {currentType}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {summary.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {summary.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {summary.mapped}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mapped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Request Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? <MaterialIcon sx={{ mr: 1 }} /> : <ToolIcon sx={{ mr: 1 }} />}
              Request {currentType}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Material/Tool Name */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label={`${currentType} Name`}
                    name="materialName"
                    value={formData.materialName}
                    onChange={handleInputChange}
                    required
                  >
                    {/* Project-based options */}
                    {currentOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                    {/* Other option */}
                    <MenuItem value="Other">
                      <CustomIcon sx={{ mr: 1, fontSize: 16 }} />
                      Other (Custom {currentType})
                    </MenuItem>
                  </TextField>
                </Grid>

                {/* Custom Name Input (shown when "Other" is selected) */}
                {showCustomInput && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={`Custom ${currentType} Name`}
                      name="customName"
                      value={formData.customName}
                      onChange={handleInputChange}
                      required
                      helperText={`This custom ${currentType.toLowerCase()} will be added to the project list after admin approval`}
                    />
                  </Grid>
                )}

                {/* Quantity and Specification */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Specification"
                    name="specification"
                    value={formData.specification}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                {/* Size */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    helperText="Add more size options"
                  />
                </Grid>

                {/* Priority */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Area in Use */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Area in use"
                    name="areaInUse"
                    value={formData.areaInUse}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>

                {/* Status Message */}
                {submitStatus && (
                  <Grid item xs={12}>
                    <Alert severity={submitStatus.includes('✅') ? 'success' : 'error'}>
                      {submitStatus}
                    </Alert>
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? 'Submitting...' : `Request ${currentType}`}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Request History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {currentType} Requests ({filteredRequests.length})
            </Typography>

            <List>
              {filteredRequests.map((request, index) => (
                <div key={request.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getStatusIcon(request.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getDisplayName(request)}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            <strong>Qty:</strong> {request.quantity} | <strong>Size:</strong> {request.size}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            <strong>Spec:</strong> {request.specification}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            <strong>Area:</strong> {request.areaInUse.substring(0, 50)}...
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </Typography>
                          {request.customName && (
                            <>
                              <br />
                              <Typography component="span" variant="body2" color="info.main">
                                Custom {currentType}: {request.customName}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                    <Box>
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status)} 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                      <br />
                      <Chip 
                        label={request.priority} 
                        color={getPriorityColor(request.priority)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </ListItem>
                  {index < filteredRequests.length - 1 && <Divider />}
                </div>
              ))}
            </List>

            {filteredRequests.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No {currentType.toLowerCase()} requests yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
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