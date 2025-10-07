// src/Pages/SuperAdmin/ProjectsOverview/ProjectsOverview.jsx
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
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs
} from '@mui/material';
import {
  Business as ProjectIcon,
  Visibility as ViewIcon,
  People as SupervisorsIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  Assignment as ScopeIcon,
  TrendingUp as ProgressIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as RequestIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const ProjectsOverview = () => {
  const { projects } = useProject();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [projectAnalytics, setProjectAnalytics] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    calculateProjectAnalytics();
  }, [projects]);

  const calculateProjectAnalytics = () => {
    const analytics = projects.map(project => {
      // Calculate overall project progress
      let overallProgress = 0;
      let completedScopeItems = 0;
      let totalScopeItems = project.scopeOfWork?.length || 0;

      if (project.scopeOfWork && project.scopeOfWork.length > 0) {
        const totalWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.total || 0), 0);
        const completedWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.done || 0), 0);
        const instockWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.instock || 0), 0);
        
        overallProgress = totalWork > 0 ? (completedWork / totalWork) * 100 : 0;
        completedScopeItems = project.scopeOfWork.filter(scope => scope.done >= scope.total).length;
      }

      // Get project requests
      const projectRequests = getProjectRequests(project.id);
      const materialRequests = projectRequests.filter(r => r.type === 'Material');
      const toolRequests = projectRequests.filter(r => r.type === 'Tool');

      // Calculate material and tool stats
      const materialStats = {
        total: project.materials?.length || 0,
        requested: materialRequests.length,
        approved: materialRequests.filter(r => r.status === 'Approved').length,
        pending: materialRequests.filter(r => r.status === 'Pending').length
      };

      const toolStats = {
        total: project.tools?.length || 0,
        requested: toolRequests.length,
        approved: toolRequests.filter(r => r.status === 'Approved').length,
        pending: toolRequests.filter(r => r.status === 'Pending').length
      };

      // Supervisor analytics
      const supervisorStats = {
        total: project.supervisors?.length || 0,
        confirmed: project.supervisors?.filter(s => !s.needsConfirmation).length || 0,
        pending: project.supervisors?.filter(s => s.needsConfirmation).length || 0
      };

      return {
        id: project.id,
        name: project.projectDetails?.projectName || project.projectName || 'Unnamed Project',
        status: project.status || 'Active',
        progress: Math.round(overallProgress),
        location: project.projectDetails?.location || 'Not specified',
        startDate: project.createdAt,
        completedAt: project.completedAt,
        priority: project.priority || 'Medium',
        description: project.projectDetails?.description || '',
        
        // Scope analytics
        scopeStats: {
          total: totalScopeItems,
          completed: completedScopeItems,
          inProgress: totalScopeItems - completedScopeItems,
          progress: overallProgress
        },

        // Resource analytics
        materialStats,
        toolStats,
        supervisorStats,

        // Request analytics
        requestStats: {
          total: projectRequests.length,
          materials: materialRequests.length,
          tools: toolRequests.length,
          pending: projectRequests.filter(r => r.status === 'Pending').length,
          approved: projectRequests.filter(r => r.status === 'Approved').length
        },

        // Raw data for details
        project: project,
        requests: projectRequests
      };
    });

    setProjectAnalytics(analytics);
  };

  const getProjectRequests = (projectId) => {
    const stored = localStorage.getItem(`requests_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'info';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
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

  const handleViewProject = (projectData) => {
    setSelectedProject(projectData);
    setShowDetailsDialog(true);
  };

  const filteredProjects = filterStatus === 'All' 
    ? projectAnalytics 
    : projectAnalytics.filter(p => p.status === filterStatus);

  // Calculate summary stats
  const summaryStats = {
    total: projectAnalytics.length,
    active: projectAnalytics.filter(p => p.status === 'Active').length,
    completed: projectAnalytics.filter(p => p.status === 'Completed').length,
    onHold: projectAnalytics.filter(p => p.status === 'On Hold').length,
    avgProgress: projectAnalytics.length > 0 
      ? Math.round(projectAnalytics.reduce((sum, p) => sum + p.progress, 0) / projectAnalytics.length)
      : 0
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          All Projects Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive view of all projects with work progress, materials, and tools
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="primary" fontWeight={700}>
              {summaryStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {summaryStats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h3" color="info.main" fontWeight={700}>
              {summaryStats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Projects
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e5f5' }}>
            <Typography variant="h3" color="secondary.main" fontWeight={700}>
              {summaryStats.avgProgress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Progress
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            const statuses = ['All', 'Active', 'Completed', 'On Hold'];
            setFilterStatus(statuses[newValue]);
          }}
        >
          <Tab label={`All Projects (${summaryStats.total})`} />
          <Tab label={`Active (${summaryStats.active})`} />
          <Tab label={`Completed (${summaryStats.completed})`} />
          <Tab label={`On Hold (${summaryStats.onHold})`} />
        </Tabs>
      </Paper>

      {/* Projects Grid View */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Project Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {project.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip 
                        label={project.status} 
                        color={getStatusColor(project.status)} 
                        size="small" 
                      />
                      <Chip 
                        label={project.priority} 
                        color={getPriorityColor(project.priority)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <IconButton 
                    onClick={() => handleViewProject(project)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                </Box>

                {/* Location & Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {project.location}
                  </Typography>
                  <DateIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Quick Stats Grid */}
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <SupervisorsIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={600}>
                          {project.supervisorStats.total} Supervisors
                        </Typography>
                      </Box>
                      {project.supervisorStats.pending > 0 && (
                        <Typography variant="caption" color="warning.main">
                          {project.supervisorStats.pending} pending
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ScopeIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="caption" fontWeight={600}>
                          {project.scopeStats.completed}/{project.scopeStats.total} Scope
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <MaterialIcon sx={{ fontSize: 16, color: 'info.main' }} />
                        <Typography variant="caption" fontWeight={600}>
                          {project.materialStats.total} Materials
                        </Typography>
                      </Box>
                      <Badge badgeContent={project.materialStats.pending} color="warning">
                        <Typography variant="caption">
                          {project.materialStats.requested} requests
                        </Typography>
                      </Badge>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ToolIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="caption" fontWeight={600}>
                          {project.toolStats.total} Tools
                        </Typography>
                      </Box>
                      <Badge badgeContent={project.toolStats.pending} color="warning">
                        <Typography variant="caption">
                          {project.toolStats.requested} requests
                        </Typography>
                      </Badge>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Projects Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Projects Table
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Project</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Progress</strong></TableCell>
                <TableCell align="center"><strong>Supervisors</strong></TableCell>
                <TableCell align="center"><strong>Scope Items</strong></TableCell>
                <TableCell align="center"><strong>Materials</strong></TableCell>
                <TableCell align="center"><strong>Tools</strong></TableCell>
                <TableCell align="center"><strong>Requests</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.location} • {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={project.supervisorStats.pending} color="warning">
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mx: 'auto' }}>
                        {project.supervisorStats.total}
                      </Avatar>
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <CompletedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption">
                        {project.scopeStats.completed}/{project.scopeStats.total}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={project.materialStats.pending} color="warning">
                      <Chip 
                        label={`${project.materialStats.total} (${project.materialStats.requested})`}
                        color="info" 
                        size="small"
                        icon={<MaterialIcon />}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={project.toolStats.pending} color="warning">
                      <Chip 
                        label={`${project.toolStats.total} (${project.toolStats.requested})`}
                        color="secondary" 
                        size="small"
                        icon={<ToolIcon />}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={project.requestStats.pending} color="error">
                      <Chip 
                        label={project.requestStats.total}
                        color="default" 
                        size="small"
                        icon={<RequestIcon />}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewProject(project)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Project Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Project Details - {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              {/* Project Overview */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Project Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><ProjectIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Status" 
                          secondary={
                            <Chip 
                              label={selectedProject.status} 
                              color={getStatusColor(selectedProject.status)} 
                              size="small" 
                            />
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText primary="Location" secondary={selectedProject.location} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DateIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Start Date" 
                          secondary={new Date(selectedProject.startDate).toLocaleDateString()} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><ProgressIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Overall Progress" 
                          secondary={`${selectedProject.progress}%`} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Resource Summary</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <SupervisorsIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                          <Typography variant="h6">{selectedProject.supervisorStats.total}</Typography>
                          <Typography variant="caption">Supervisors</Typography>
                          {selectedProject.supervisorStats.pending > 0 && (
                            <Chip label={`${selectedProject.supervisorStats.pending} pending`} color="warning" size="small" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <ScopeIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                          <Typography variant="h6">{selectedProject.scopeStats.total}</Typography>
                          <Typography variant="caption">Scope Items</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {selectedProject.scopeStats.completed} completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <MaterialIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                          <Typography variant="h6">{selectedProject.materialStats.total}</Typography>
                          <Typography variant="caption">Materials</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {selectedProject.materialStats.requested} requested
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <ToolIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                          <Typography variant="h6">{selectedProject.toolStats.total}</Typography>
                          <Typography variant="caption">Tools</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {selectedProject.toolStats.requested} requested
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detailed Scope of Work */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Scope of Work Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Scope Item</TableCell>
                          <TableCell align="center">Total</TableCell>
                          <TableCell align="center">Instock</TableCell>
                          <TableCell align="center">Done</TableCell>
                          <TableCell align="center">Balance</TableCell>
                          <TableCell align="center">Progress</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProject.project.scopeOfWork?.map((scope, index) => (
                          <TableRow key={index}>
                            <TableCell>{scope.scopeOfWork}</TableCell>
                            <TableCell align="center">{scope.total}</TableCell>
                            <TableCell align="center">{scope.instock || 0}</TableCell>
                            <TableCell align="center">{scope.done || 0}</TableCell>
                            <TableCell align="center">{scope.total - (scope.instock || 0)}</TableCell>
                            <TableCell align="center">
                              <LinearProgress 
                                variant="determinate" 
                                value={scope.total > 0 ? (scope.done || 0) / scope.total * 100 : 0} 
                                sx={{ height: 6 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* Recent Requests */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Recent Requests</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedProject.requests.slice(0, 10).map((request, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {request.type === 'Material' ? <MaterialIcon /> : <ToolIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${request.materialName} (${request.quantity})`}
                          secondary={`${request.type} • ${request.status} • ${new Date(request.requestDate).toLocaleDateString()}`}
                        />
                        <Chip 
                          label={request.status} 
                          color={
                            request.status === 'Approved' ? 'success' :
                            request.status === 'Pending' ? 'warning' :
                            request.status === 'Rejected' ? 'error' : 'info'
                          } 
                          size="small" 
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectsOverview;