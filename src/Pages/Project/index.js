// src/Pages/ProjectList/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Assignment as ProjectIcon,
  Group as SupervisorsIcon,
  Inventory as MaterialsIcon,
  Build as ToolsIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Mock project data - replace with actual data source
const mockProjects = [
  {
    id: 'PROJ-001',
    projectName: 'Mumbai Office Complex',
    jobNo: 'JOB-2025-001',
    orderNo: 'ORD-2025-001',
    dateOfCompletion: '2025-12-31',
    location: 'Mumbai, Maharashtra',
    client: 'ABC Construction Ltd.',
    status: 'Active',
    priority: 'High',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-09-20T14:30:00Z',
    progress: 65,
    budget: 5000000,
    spent: 3250000,
    // Scope data
    scopeItems: 12,
    scopeCompleted: 8,
    scopeInProgress: 3,
    scopePending: 1,
    // Material & Tool data
    materials: 25,
    tools: 18,
    // Team data
    supervisors: [
      { id: 'SUP001', name: 'Rajesh Kumar', avatar: null, status: 'Active' },
      { id: 'SUP002', name: 'Priya Sharma', avatar: null, status: 'Active' }
    ],
    employees: 15,
    // Recent activity
    lastActivity: '2025-09-20T14:30:00Z',
    activityDescription: 'Material request approved by Rajesh Kumar'
  },
  {
    id: 'PROJ-002',
    projectName: 'Delhi Metro Station',
    jobNo: 'JOB-2025-002',
    orderNo: 'ORD-2025-002',
    dateOfCompletion: '2026-03-15',
    location: 'Delhi, India',
    client: 'Delhi Metro Rail Corporation',
    status: 'Active',
    priority: 'High',
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-09-19T16:45:00Z',
    progress: 35,
    budget: 8000000,
    spent: 2800000,
    scopeItems: 18,
    scopeCompleted: 6,
    scopeInProgress: 8,
    scopePending: 4,
    materials: 45,
    tools: 32,
    supervisors: [
      { id: 'SUP003', name: 'Arun Patel', avatar: null, status: 'Active' },
      { id: 'SUP004', name: 'Meera Singh', avatar: null, status: 'Active' },
      { id: 'SUP005', name: 'Vikram Shah', avatar: null, status: 'Pending' }
    ],
    employees: 25,
    lastActivity: '2025-09-19T16:45:00Z',
    activityDescription: 'Scope progress updated by Arun Patel'
  },
  {
    id: 'PROJ-003',
    projectName: 'Bangalore Tech Park',
    jobNo: 'JOB-2025-003',
    orderNo: 'ORD-2025-003',
    dateOfCompletion: '2025-11-30',
    location: 'Bangalore, Karnataka',
    client: 'Tech Solutions Pvt Ltd',
    status: 'Completed',
    priority: 'Medium',
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-08-30T17:00:00Z',
    progress: 100,
    budget: 3500000,
    spent: 3350000,
    scopeItems: 8,
    scopeCompleted: 8,
    scopeInProgress: 0,
    scopePending: 0,
    materials: 18,
    tools: 12,
    supervisors: [
      { id: 'SUP006', name: 'Suresh Reddy', avatar: null, status: 'Completed' }
    ],
    employees: 8,
    lastActivity: '2025-08-30T17:00:00Z',
    activityDescription: 'Project completed successfully'
  },
  {
    id: 'PROJ-004',
    projectName: 'Chennai Port Development',
    jobNo: 'JOB-2025-004',
    orderNo: 'ORD-2025-004',
    dateOfCompletion: '2026-06-30',
    location: 'Chennai, Tamil Nadu',
    client: 'Chennai Port Trust',
    status: 'On Hold',
    priority: 'Low',
    createdAt: '2025-03-10T11:00:00Z',
    updatedAt: '2025-07-15T12:00:00Z',
    progress: 15,
    budget: 12000000,
    spent: 1800000,
    scopeItems: 25,
    scopeCompleted: 4,
    scopeInProgress: 0,
    scopePending: 21,
    materials: 65,
    tools: 45,
    supervisors: [
      { id: 'SUP007', name: 'Kamala Devi', avatar: null, status: 'On Hold' }
    ],
    employees: 12,
    lastActivity: '2025-07-15T12:00:00Z',
    activityDescription: 'Project put on hold due to permit issues'
  }
];

const Project = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProjectForMenu, setSelectedProjectForMenu] = useState(null);

  useEffect(() => {
    handleFilterProjects();
  }, [searchQuery, statusFilter, priorityFilter, projects]);

  const handleFilterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.jobNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectForMenu(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectForMenu(null);
  };

  const handleEditProject = (project) => {
    // Navigate to edit project page
    navigate(`/admin/projects/${project.id}/edit`);
    handleMenuClose();
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`Are you sure you want to delete project "${project.projectName}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== project.id));
    }
    handleMenuClose();
  };

  const renderProjectCards = () => (
    <Grid container spacing={3}>
      {filteredProjects.map((project) => (
        <Grid item xs={12} sm={6} lg={4} key={project.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {project.projectName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.jobNo}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={project.status} 
                    color={getStatusColor(project.status)} 
                    size="small" 
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, project)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Client & Location */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CompanyIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {project.client}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {project.location}
                  </Typography>
                </Box>
              </Box>

              {/* Progress */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Progress
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {project.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: 
                        project.progress >= 80 ? 'success.main' :
                        project.progress >= 50 ? 'warning.main' : 'primary.main'
                    }
                  }}
                />
              </Box>

              {/* Stats */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {project.scopeItems}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Scope Items
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary">
                      {project.supervisors.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supervisors
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Team */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight={500}>
                  Team
                </Typography>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                  {project.supervisors.map((supervisor, index) => (
                    <Tooltip key={supervisor.id} title={supervisor.name}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {supervisor.name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </Box>

              {/* Due Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DateIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Due: {formatDate(project.dateOfCompletion)}
                </Typography>
              </Box>

              {/* Priority */}
              <Chip 
                label={`${project.priority} Priority`}
                color={getPriorityColor(project.priority)}
                size="small"
                variant="outlined"
              />
            </CardContent>

            {/* Actions */}
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => handleViewProject(project)}
              >
                View Details
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderProjectTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Project</strong></TableCell>
            <TableCell><strong>Client</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell align="center"><strong>Progress</strong></TableCell>
            <TableCell align="center"><strong>Team</strong></TableCell>
            <TableCell><strong>Due Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {project.projectName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.jobNo}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {project.client}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {project.location}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ minWidth: 80 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ mb: 1 }}
                    color={
                      project.progress >= 80 ? 'success' :
                      project.progress >= 50 ? 'warning' : 'primary'
                    }
                  />
                  <Typography variant="caption">
                    {project.progress}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <SupervisorsIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {project.supervisors.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    / {project.employees} total
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(project.dateOfCompletion)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={project.status} 
                  color={getStatusColor(project.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleViewProject(project)} color="primary" size="small">
                  <ViewIcon />
                </IconButton>
                <IconButton onClick={(e) => handleMenuClick(e, project)} color="default" size="small">
                  <MoreIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    return (
      <Dialog open={showProjectDetails} onClose={() => setShowProjectDetails(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ProjectIcon />
            <Box>
              <Typography variant="h6">{selectedProject.projectName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedProject.jobNo} • {selectedProject.orderNo}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Overview" />
            <Tab label="Scope Progress" />
            <Tab label="Team & Resources" />
            <Tab label="Financial" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Project Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Project Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Client" secondary={selectedProject.client} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Location" secondary={selectedProject.location} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Due Date" secondary={formatDate(selectedProject.dateOfCompletion)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Priority" secondary={
                        <Chip label={selectedProject.priority} color={getPriorityColor(selectedProject.priority)} size="small" />
                      } />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Status" secondary={
                        <Chip label={selectedProject.status} color={getStatusColor(selectedProject.status)} size="small" />
                      } />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Progress Overview */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Progress Overview</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Overall Progress</Typography>
                      <Typography fontWeight={600}>{selectedProject.progress}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={selectedProject.progress} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {selectedProject.scopeCompleted}
                        </Typography>
                        <Typography variant="caption">Completed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main">
                          {selectedProject.scopeInProgress}
                        </Typography>
                        <Typography variant="caption">In Progress</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="error.main">
                          {selectedProject.scopePending}
                        </Typography>
                        <Typography variant="caption">Pending</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ProjectIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{selectedProject.activityDescription}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTimeSince(selectedProject.lastActivity)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Scope of Work Progress</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                    <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {selectedProject.scopeCompleted}
                    </Typography>
                    <Typography variant="body2">Completed Items</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                    <PendingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {selectedProject.scopeInProgress}
                    </Typography>
                    <Typography variant="body2">In Progress</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
                    <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" color="error.main">
                      {selectedProject.scopePending}
                    </Typography>
                    <Typography variant="body2">Pending Items</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Supervisors ({selectedProject.supervisors.length})</Typography>
                  <List>
                    {selectedProject.supervisors.map((supervisor) => (
                      <ListItem key={supervisor.id}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {supervisor.name.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={supervisor.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption">{supervisor.id}</Typography>
                              <Chip
                                label={supervisor.status}
                                size="small"
                                color={supervisor.status === 'Active' ? 'success' : 
                                       supervisor.status === 'Pending' ? 'warning' : 'default'}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Resources</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                        <MaterialsIcon color="primary" />
                        <Box>
                          <Typography variant="h6">{selectedProject.materials}</Typography>
                          <Typography variant="caption">Materials</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                        <ToolsIcon color="secondary" />
                        <Box>
                          <Typography variant="h6">{selectedProject.tools}</Typography>
                          <Typography variant="caption">Tools</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                        <SupervisorsIcon color="info" />
                        <Box>
                          <Typography variant="h6">{selectedProject.employees}</Typography>
                          <Typography variant="caption">Total Team Members</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Financial Overview</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(selectedProject.budget)}
                    </Typography>
                    <Typography variant="body2">Total Budget</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(selectedProject.spent)}
                    </Typography>
                    <Typography variant="body2">Amount Spent</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(selectedProject.budget - selectedProject.spent)}
                    </Typography>
                    <Typography variant="body2">Remaining Budget</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Budget Utilization: {((selectedProject.spent / selectedProject.budget) * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(selectedProject.spent / selectedProject.budget) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowProjectDetails(false)}>Close</Button>
          <Button variant="contained" onClick={() => handleEditProject(selectedProject)}>
            Edit Project
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Project Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/projects/create')}
            sx={{ minWidth: 160 }}
          >
            Create New Project
          </Button>
        </Box>
      </Paper>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects, job numbers, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="All">All Priority</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredProjects.length} of {projects.length} projects
              </Typography>
              <Chip 
                label={`${projects.filter(p => p.status === 'Active').length} Active`} 
                color="success" 
                size="small" 
              />
              <Chip 
                label={`${projects.filter(p => p.status === 'Completed').length} Completed`} 
                color="primary" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Projects Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first project'
            }
          </Typography>
          {!searchQuery && statusFilter === 'All' && priorityFilter === 'All' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/projects/create')}
            >
              Create New Project
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {/* Desktop: Cards, Mobile: Table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {renderProjectCards()}
          </Box>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {renderProjectTable()}
          </Box>
        </Box>
      )}

      {/* Project Details Dialog */}
      {renderProjectDetails()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewProject(selectedProjectForMenu)}>
          <ListItemIcon><ViewIcon /></ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEditProject(selectedProjectForMenu)}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit Project
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteProject(selectedProjectForMenu)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon sx={{ color: 'error.main' }} /></ListItemIcon>
          Delete Project
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Project;