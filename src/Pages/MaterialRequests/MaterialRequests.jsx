// src/Pages/MaterialRequests/MaterialRequests.jsx - FIXED ADMIN VERSION
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment
} from '@mui/material';
import {
  Inventory as MaterialIcon,
  Build as ToolIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as MapIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Assignment as ProjectIcon,
  CalendarToday as DateIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useProject } from '../../contexts/ProjectContext';

const MaterialRequests = () => {
  const { projects } = useProject();
  
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=Material, 2=Tool
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionRemark, setActionRemark] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllRequests();
  }, [projects]);

  useEffect(() => {
    handleFilterRequests();
  }, [requests, activeTab, statusFilter, priorityFilter, searchQuery]);

  const loadAllRequests = () => {
    setLoading(true);
    
    // Collect all requests from all projects
    const allRequests = [];
    
    projects.forEach(project => {
      // Load requests stored per project
      const projectRequests = localStorage.getItem(`requests_${project.id}`);
      if (projectRequests) {
        const parsedRequests = JSON.parse(projectRequests);
        
        // Add project info to each request
        const enrichedRequests = parsedRequests.map(request => ({
          ...request,
          projectId: project.id,
          projectName: project.projectDetails?.projectName || project.projectName || 'Unknown Project',
          // Find supervisor name from project
          supervisorName: project.supervisors?.find(s => s.employeeId === request.requestedBy || s.name === request.requestedBy)?.name || request.requestedBy || 'Unknown Supervisor'
        }));
        
        allRequests.push(...enrichedRequests);
      }
    });

    // Sort by request date (newest first)
    allRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    setRequests(allRequests);
    setLoading(false);
  };

  const handleFilterRequests = () => {
    let filtered = requests;

    // Tab filter
    if (activeTab === 1) {
      filtered = filtered.filter(req => req.type === 'Material');
    } else if (activeTab === 2) {
      filtered = filtered.filter(req => req.type === 'Tool');
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.customName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.specification.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleRequestAction = async (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setActionRemark('');
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    const updatedRequest = {
      ...selectedRequest,
      status: actionType === 'approve' ? 'Approved' : actionType === 'reject' ? 'Rejected' : 'Mapped',
      actionDate: new Date().toISOString(),
      actionBy: 'admin', // Should come from auth context
      actionRemark: actionRemark || ''
    };

    // Update in the original project's localStorage
    const projectRequests = JSON.parse(localStorage.getItem(`requests_${selectedRequest.projectId}`) || '[]');
    const updatedProjectRequests = projectRequests.map(req => 
      req.id === selectedRequest.id ? updatedRequest : req
    );
    localStorage.setItem(`requests_${selectedRequest.projectId}`, JSON.stringify(updatedProjectRequests));

    // Update local state
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest.id && req.projectId === selectedRequest.projectId 
        ? updatedRequest 
        : req
    ));

    // Also save to global admin requests log
    const adminLog = JSON.parse(localStorage.getItem('admin_request_actions') || '[]');
    adminLog.push({
      requestId: selectedRequest.id,
      projectId: selectedRequest.projectId,
      action: actionType,
      actionDate: new Date().toISOString(),
      actionBy: 'admin',
      actionRemark: actionRemark,
      originalRequest: selectedRequest
    });
    localStorage.setItem('admin_request_actions', JSON.stringify(adminLog));

    setShowActionDialog(false);
    setSelectedRequest(null);
    setActionRemark('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <ApproveIcon color="success" />;
      case 'Pending': return <PendingIcon color="warning" />;
      case 'Rejected': return <RejectIcon color="error" />;
      case 'Mapped': return <MapIcon color="info" />;
      default: return <WarningIcon />;
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

  // Calculate summary statistics
  const summary = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'Pending').length,
    approved: filteredRequests.filter(r => r.status === 'Approved').length,
    rejected: filteredRequests.filter(r => r.status === 'Rejected').length,
    mapped: filteredRequests.filter(r => r.status === 'Mapped').length,
    materials: filteredRequests.filter(r => r.type === 'Material').length,
    tools: filteredRequests.filter(r => r.type === 'Tool').length
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Loading requests...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Material & Tool Requests Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Review and manage all supervisor requests across projects
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {summary.total}
            </Typography>
            <Typography variant="caption">Total Requests</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">
              {summary.pending}
            </Typography>
            <Typography variant="caption">Pending</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h4" color="success.main">
              {summary.approved}
            </Typography>
            <Typography variant="caption">Approved</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="h4" color="error.main">
              {summary.rejected}
            </Typography>
            <Typography variant="caption">Rejected</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h4" color="info.main">
              {summary.mapped}
            </Typography>
            <Typography variant="caption">Mapped</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6">
              {summary.materials}/{summary.tools}
            </Typography>
            <Typography variant="caption">Mat/Tools</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Tabs */}
      <Paper sx={{ mb: 3 }}>
        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={summary.total} color="primary">
                All Requests
              </Badge>
            } 
          />
          <Tab 
            icon={<MaterialIcon />} 
            iconPosition="start"
            label={
              <Badge badgeContent={summary.materials} color="secondary">
                Materials
              </Badge>
            } 
          />
          <Tab 
            icon={<ToolIcon />} 
            iconPosition="start"
            label={
              <Badge badgeContent={summary.tools} color="info">
                Tools
              </Badge>
            } 
          />
        </Tabs>

        {/* Filters */}
        <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search requests, projects, supervisors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Mapped">Mapped</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="All">All Priority</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRequests.length} of {requests.length} requests
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MaterialIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Requests Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {requests.length === 0 
              ? 'No requests have been submitted by supervisors yet.'
              : 'Try adjusting your search or filter criteria.'
            }
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Request Details</strong></TableCell>
                <TableCell><strong>Project Info</strong></TableCell>
                <TableCell><strong>Supervisor</strong></TableCell>
                <TableCell align="center"><strong>Quantity</strong></TableCell>
                <TableCell align="center"><strong>Priority</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={`${request.projectId}-${request.id}`} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {getDisplayName(request)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.type} • {request.size}
                      </Typography>
                      {request.customName && (
                        <Chip label="Custom" color="warning" size="small" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {request.projectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.projectId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {request.supervisorName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {request.supervisorName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {request.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={request.priority} 
                      color={getPriorityColor(request.priority)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {getStatusIcon(request.status)}
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status)} 
                        size="small" 
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(request.requestDate).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {request.status === 'Pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleRequestAction(request, 'approve')}
                            title="Approve"
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRequestAction(request, 'reject')}
                            title="Reject"
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                      
                      {request.status === 'Approved' && (
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleRequestAction(request, 'map')}
                          title="Map to Challan"
                        >
                          <MapIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Request Details - {selectedRequest && getDisplayName(selectedRequest)}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Request Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><MaterialIcon /></ListItemIcon>
                    <ListItemText primary="Type" secondary={selectedRequest.type} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Item Name" secondary={getDisplayName(selectedRequest)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Quantity" secondary={selectedRequest.quantity} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Size/Dimensions" secondary={selectedRequest.size} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Priority" secondary={
                      <Chip label={selectedRequest.priority} color={getPriorityColor(selectedRequest.priority)} size="small" />
                    } />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Project & Supervisor</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><ProjectIcon /></ListItemIcon>
                    <ListItemText primary="Project" secondary={selectedRequest.projectName} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Requested By" secondary={selectedRequest.supervisorName} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><DateIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Request Date" 
                      secondary={new Date(selectedRequest.requestDate).toLocaleString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Status" secondary={
                      <Chip label={selectedRequest.status} color={getStatusColor(selectedRequest.status)} size="small" />
                    } />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Specification</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2">
                    {selectedRequest.specification}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Area of Use</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2">
                    {selectedRequest.areaInUse}
                  </Typography>
                </Paper>
              </Grid>
              
              {selectedRequest.actionRemark && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Admin Remarks</Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                    <Typography variant="body2">
                      {selectedRequest.actionRemark}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Action taken on: {new Date(selectedRequest.actionDate).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Request' : 
           actionType === 'reject' ? 'Reject Request' : 'Map Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Request:</strong> {getDisplayName(selectedRequest)} ({selectedRequest.quantity} units)
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Project:</strong> {selectedRequest.projectName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                <strong>Supervisor:</strong> {selectedRequest.supervisorName}
              </Typography>
              
              <TextField
                fullWidth
                label={`${actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Mapping'} Remarks`}
                multiline
                rows={3}
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
                placeholder={
                  actionType === 'approve' ? 'Optional: Add any approval notes...' :
                  actionType === 'reject' ? 'Required: Explain reason for rejection...' :
                  'Optional: Add mapping or delivery notes...'
                }
                required={actionType === 'reject'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'error' : 'info'}
            onClick={confirmAction}
            disabled={actionType === 'reject' && !actionRemark.trim()}
          >
            {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Map'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaterialRequests;