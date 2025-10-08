// src/Pages/Admin/AdminHome/AdminHome.jsx - Admin Dashboard Overview
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Alert
} from '@mui/material';

import {
  TrendingUp as TrendingUpIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Assignment as TaskIcon,
  LocalShipping as RequestIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useProject } from '../../../contexts/ProjectContext';

const AdminHome = () => {
  const { user } = useAuth();
  const { projects } = useProject();
  const [adminAnalytics, setAdminAnalytics] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [projectAnalytics, setProjectAnalytics] = useState([]);

  useEffect(() => {
    calculateAdminAnalytics();
    loadRecentActivities();
    loadPendingApprovals();
    calculateProjectAnalytics();
  }, [projects]);

  const calculateAdminAnalytics = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;

    // Calculate total supervisors
    const allSupervisors = new Set();
    projects.forEach(project => {
      project.supervisors?.forEach(supervisor => {
        allSupervisors.add(supervisor.employeeId || supervisor.id);
      });
    });

    // Calculate requests
    const allRequests = getAllRequests();
    const pendingRequests = allRequests.filter(r => r.status === 'Pending');
    const approvedRequests = allRequests.filter(r => r.status === 'Approved');
    const materialRequests = allRequests.filter(r => r.type === 'Material');
    const toolRequests = allRequests.filter(r => r.type === 'Tool');

    // Calculate supervisor confirmations needed
    const pendingSupervisorConfirmations = projects.reduce((count, project) => {
      return count + (project.supervisors?.filter(s => s.needsConfirmation).length || 0);
    }, 0);

    // Calculate overall progress
    let totalProgress = 0;
    projects.forEach(project => {
      if (project.scopeOfWork && project.scopeOfWork.length > 0) {
        const projectProgress = project.scopeOfWork.reduce((sum, scope) => {
          const scopeProgress = scope.total > 0 ? (scope.done / scope.total) * 100 : 0;
          return sum + scopeProgress;
        }, 0) / project.scopeOfWork.length;
        totalProgress += projectProgress;
      }
    });
    const avgProgress = totalProjects > 0 ? totalProgress / totalProjects : 0;

    setAdminAnalytics({
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalSupervisors: allSupervisors.size,
      totalRequests: allRequests.length,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      materialRequests: materialRequests.length,
      toolRequests: toolRequests.length,
      pendingSupervisorConfirmations,
      avgProgress: Math.round(avgProgress),
      approvalRate: allRequests.length > 0 ? Math.round((approvedRequests.length / allRequests.length) * 100) : 0
    });
  };

  const calculateProjectAnalytics = () => {
    const analytics = projects.map(project => {
      // Calculate project progress
      let overallProgress = 0;
      if (project.scopeOfWork && project.scopeOfWork.length > 0) {
        const totalWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.total || 0), 0);
        const completedWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.done || 0), 0);
        overallProgress = totalWork > 0 ? (completedWork / totalWork) * 100 : 0;
      }

      // Get project requests
      const projectRequests = getProjectRequests(project.id);
      const pendingProjectRequests = projectRequests.filter(r => r.status === 'Pending');
      
      return {
        id: project.id,
        name: project.projectDetails?.projectName || project.projectName || 'Unnamed Project',
        status: project.status || 'Active',
        progress: Math.round(overallProgress),
        supervisors: project.supervisors?.length || 0,
        pendingConfirmations: project.supervisors?.filter(s => s.needsConfirmation).length || 0,
        totalRequests: projectRequests.length,
        pendingRequests: pendingProjectRequests.length,
        location: project.projectDetails?.location || 'Not specified',
        priority: project.priority || 'Medium'
      };
    });

    setProjectAnalytics(analytics);
  };

  const loadPendingApprovals = () => {
    const allRequests = getAllRequests();
    const pending = allRequests
      .filter(r => r.status === 'Pending')
      .map(request => ({
        ...request,
        projectName: projects.find(p => p.id === request.projectId)?.projectDetails?.projectName || 'Unknown Project'
      }))
      .slice(0, 10); // Show top 10 pending approvals

    setPendingApprovals(pending);
  };

  const loadRecentActivities = () => {
    const activities = [];
    
    // Add recent project activities
    projects.slice(0, 3).forEach(project => {
      activities.push({
        type: 'project',
        title: `Project: ${project.projectDetails?.projectName || project.projectName}`,
        subtitle: `Status: ${project.status || 'Active'}`,
        time: project.createdAt || new Date().toISOString(),
        icon: ProjectIcon,
        color: 'primary'
      });
    });

    // Add recent requests
    const allRequests = getAllRequests();
    allRequests.slice(0, 5).forEach(request => {
      const project = projects.find(p => p.id === request.projectId);
      activities.push({
        type: 'request',
        title: `${request.type} Request: ${request.materialName}`,
        subtitle: `Project: ${project?.projectDetails?.projectName || 'Unknown'} - ${request.status}`,
        time: request.requestDate,
        icon: request.type === 'Material' ? MaterialIcon : ToolIcon,
        color: request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'
      });
    });

    // Sort by time and take most recent
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivities(activities.slice(0, 8));
  };

  const getAllRequests = () => {
    const allRequests = [];
    projects.forEach(project => {
      const projectRequests = getProjectRequests(project.id);
      allRequests.push(...projectRequests.map(req => ({
        ...req,
        projectId: project.id
      })));
    });
    return allRequests;
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

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {user?.name || 'Administrator'}!
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Admin Dashboard - Manage projects, approvals, and system oversight
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ color: 'primary.main' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {adminAnalytics.totalProjects || 0}
                  </Typography>
                  <Typography variant="subtitle1">Total Projects</Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={adminAnalytics.totalProjects ? (adminAnalytics.activeProjects / adminAnalytics.totalProjects) * 100 : 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {adminAnalytics.activeProjects || 0} Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {adminAnalytics.totalSupervisors || 0}
                  </Typography>
                  <Typography variant="subtitle1">Supervisors</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {adminAnalytics.pendingSupervisorConfirmations || 0} pending confirmations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {adminAnalytics.pendingRequests || 0}
                  </Typography>
                  <Typography variant="subtitle1">Pending Approvals</Typography>
                </Box>
                <Badge badgeContent={adminAnalytics.pendingRequests || 0} color="error">
                  <RequestIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Badge>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {adminAnalytics.approvalRate || 0}% approval rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {adminAnalytics.avgProgress || 0}%
                  </Typography>
                  <Typography variant="subtitle1">Avg Progress</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={adminAnalytics.avgProgress || 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Across all projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Overview & Pending Approvals */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Projects Overview
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Project</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Progress</strong></TableCell>
                    <TableCell align="center"><strong>Supervisors</strong></TableCell>
                    <TableCell align="center"><strong>Pending</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectAnalytics.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.location}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="body2">
                            {project.supervisors}
                          </Typography>
                          {project.pendingConfirmations > 0 && (
                            <Chip 
                              label={project.pendingConfirmations} 
                              color="warning" 
                              size="small"
                              sx={{ minWidth: 20, height: 20 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={project.pendingRequests} color="warning">
                          <Chip 
                            label={project.totalRequests} 
                            color="default" 
                            size="small" 
                          />
                        </Badge>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="View Details">
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Pending Approvals
            </Typography>
            {pendingApprovals.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {pendingApprovals.map((approval, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      {approval.type === 'Material' ? 
                        <MaterialIcon color="warning" /> : 
                        <ToolIcon color="warning" />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={approval.materialName}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Project: {approval.projectName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {approval.quantity || 1} | {new Date(approval.requestDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {/* <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} /> */}
                <Typography color="text.secondary">
                  No pending approvals!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Request Statistics & Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {adminAnalytics.materialRequests || 0}
                  </Typography>
                  <Typography variant="body2">Material Requests</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {adminAnalytics.toolRequests || 0}
                  </Typography>
                  <Typography variant="body2">Tool Requests</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={adminAnalytics.approvalRate || 0} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {adminAnalytics.approvalRate || 0}% Overall Approval Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '200px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List sx={{ maxHeight: 140, overflow: 'auto' }} dense>
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <IconComponent color={activity.color} />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {activity.subtitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.time).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminHome;