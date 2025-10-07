// src/Pages/Supervisor/MaterialToolRequest/MaterialToolRequestUpdated.jsx - FIXED VERSION
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
  Badge
} from '@mui/material';
import {
  Build as ToolIcon,
  Inventory as MaterialIcon,
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  LocalShipping as MappedIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useProject } from '../../../contexts/ProjectContext';

const MaterialToolRequest = () => {
  const { user } = useAuth();
  const { getProjectBySupervisor, needsConfirmation } = useProject();
  
  const [activeTab, setActiveTab] = useState(0); // 0 = Material, 1 = Tool
  const [formData, setFormData] = useState({
    materialName: '',
    customName: '',
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

  const priorityOptions = ['High', 'Medium', 'Low'];

  useEffect(() => {
    loadProjectAndCheckAuth();
  }, [user]);

  useEffect(() => {
    if (project && authorizationStatus === 'authorized') {
      loadRequestHistory();
    }
  }, [project, authorizationStatus]);

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
      const allRequests = JSON.parse(storedRequests);
      // Filter requests by current supervisor
      const supervisorRequests = allRequests.filter(req => 
        req.requestedBy === user.name || req.requestedBy === user.employeeId
      );
      setRequests(supervisorRequests);
    }
  };

  const saveRequestHistory = (updatedRequests) => {
    // Load all requests for the project
    const allProjectRequests = JSON.parse(localStorage.getItem(`requests_${project.id}`) || '[]');
    
    // Remove old requests by this supervisor
    const otherRequests = allProjectRequests.filter(req => 
      req.requestedBy !== user.name && req.requestedBy !== user.employeeId
    );
    
    // Add updated requests
    const finalRequests = [...otherRequests, ...updatedRequests];
    
    // Save back to localStorage
    localStorage.setItem(`requests_${project.id}`, JSON.stringify(finalRequests));
    
    // Also maintain global admin log for easier access
    const adminGlobalRequests = JSON.parse(localStorage.getItem('global_requests') || '[]');
    const updatedGlobalRequests = adminGlobalRequests.filter(req => 
      !(req.projectId === project.id && (req.requestedBy === user.name || req.requestedBy === user.employeeId))
    );
    
    // Add new requests to global log
    updatedRequests.forEach(request => {
      updatedGlobalRequests.push({
        ...request,
        projectId: project.id,
        projectName: project.projectDetails?.projectName || project.projectName || 'Unknown Project',
        supervisorName: user.name,
        supervisorId: user.employeeId
      });
    });
    
    localStorage.setItem('global_requests', JSON.stringify(updatedGlobalRequests));
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

  const generateRequestId = () => {
    // Generate unique request ID
    return `REQ-${project.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
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
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newRequest = {
        id: generateRequestId(),
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
        requestedById: user?.employeeId,
        requestDate: new Date().toISOString(),
        projectId: project.id,
        projectName: project.projectDetails?.projectName || project.projectName || 'Unknown Project'
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

  const handleRefreshRequests = () => {
    loadRequestHistory();
    setSubmitStatus('🔄 Request status updated!');
    setTimeout(() => setSubmitStatus(''), 2000);
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
      <Container>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Checking authorization...</Typography>
        </Box>
      </Container>
    );
  }

  if (authorizationStatus === 'needs_confirmation') {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Authorization Required</Typography>
          <Typography variant="body2">
            You need to complete the supervisor confirmation process before accessing this feature.
            Please complete the project review and confirmation steps.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (authorizationStatus === 'no_project') {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>No Project Assigned</Typography>
          <Typography variant="body2">
            No project found for your supervisor ID. Please contact admin.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Material & Tool Request
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              <strong>Project:</strong> {project?.projectDetails?.projectName || project?.projectName} | 
              <strong> Available {currentType}s:</strong> {currentOptions.length} from project scope + Custom option
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshRequests}
            size="small"
          >
            Refresh Status
          </Button>
        </Box>
      </Paper>

      {/* Toggle Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={<MaterialIcon />} 
            iconPosition="start"
            label={
              <Badge badgeContent={requests.filter(r => r.type === 'Material').length} color="primary">
                Material
              </Badge>
            }
          />
          <Tab 
            icon={<ToolIcon />} 
            iconPosition="start"
            label={
              <Badge badgeContent={requests.filter(r => r.type === 'Tool').length} color="secondary">
                Tools
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {summary.total}
            </Typography>
            <Typography variant="caption">Total {currentType}s</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">
              {summary.pending}
            </Typography>
            <Typography variant="caption">Pending</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h4" color="success.main">
              {summary.approved}
            </Typography>
            <Typography variant="caption">Approved</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="h4" color="error.main">
              {summary.rejected}
            </Typography>
            <Typography variant="caption">Rejected</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h4" color="info.main">
              {summary.mapped}
            </Typography>
            <Typography variant="caption">Mapped</Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Request Form */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {activeTab === 0 ? <MaterialIcon /> : <ToolIcon />}
              Request {currentType}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {/* Material/Tool Name */}
              <TextField
                select
                fullWidth
                label={`${currentType} Name`}
                name="materialName"
                value={formData.materialName}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              >
                {/* Project-based options */}
                {currentOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
                {/* Other option */}
                <MenuItem value="Other">
                  Other (Custom {currentType})
                </MenuItem>
              </TextField>

              {/* Custom Name Input (shown when "Other" is selected) */}
              {showCustomInput && (
                <TextField
                  fullWidth
                  label={`Custom ${currentType} Name`}
                  name="customName"
                  value={formData.customName}
                  onChange={handleInputChange}
                  required
                  helperText={`This custom ${currentType.toLowerCase()} will be added to the project list after admin approval`}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Quantity and Specification */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Size/Dimensions"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Specification"
                name="specification"
                value={formData.specification}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
                sx={{ my: 2 }}
              />

              {/* Priority */}
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              {/* Area in Use */}
              <TextField
                fullWidth
                label="Area in Use"
                name="areaInUse"
                value={formData.areaInUse}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
                sx={{ mb: 2 }}
              />

              {/* Status Message */}
              {submitStatus && (
                <Alert
                  severity={
                    submitStatus.includes('✅') ? 'success' :
                    submitStatus.includes('💾') || submitStatus.includes('🔄') ? 'info' : 'error'
                  }
                  sx={{ mb: 2 }}
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
                size="large"
                startIcon={<AddIcon />}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${currentType} Request`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Request History */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your {currentType} Requests ({filteredRequests.length})
            </Typography>

            {filteredRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No {currentType.toLowerCase()} requests yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit your first {currentType.toLowerCase()} request using the form
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredRequests.map((request, index) => (
                  <Box key={request.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(request.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {getDisplayName(request)}
                            </Typography>
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
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              <strong>Qty:</strong> {request.quantity} | <strong>Size:</strong> {request.size}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Spec:</strong> {request.specification.substring(0, 50)}...
                            </Typography>
                            <Typography variant="body2">
                              <strong>Area:</strong> {request.areaInUse.substring(0, 50)}...
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Requested: {new Date(request.requestDate).toLocaleDateString()}
                            </Typography>
                            {request.customName && (
                              <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                                Custom {currentType}: {request.customName}
                              </Typography>
                            )}
                            {request.actionRemark && (
                              <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5 }}>
                                <strong>Admin Note:</strong> {request.actionRemark}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredRequests.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MaterialToolRequest;