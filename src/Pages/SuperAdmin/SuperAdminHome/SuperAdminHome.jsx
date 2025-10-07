// src/Pages/SuperAdmin/SuperAdminHome/SuperAdminHome.jsx - Fixed without recharts
import React, { useState, useEffect, useMemo } from 'react';
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
  Divider,
  Alert,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon,
  Warning as WarningIcon,
  Assignment as ScopeIcon,
  LocalShipping as RequestIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const SuperAdminHome = () => {
  const { projects } = useProject();
  const [systemStats, setSystemStats] = useState({});
  const [projectAnalytics, setProjectAnalytics] = useState([]);
  const [materialToolStats, setMaterialToolStats] = useState({});
  const [requestsOverview, setRequestsOverview] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAllStatistics();
  }, [projects]);

  const calculateAllStatistics = () => {
    setLoading(true);
    
    // Calculate system-wide statistics
    calculateSystemStats();
    calculateProjectAnalytics();
    calculateMaterialToolStats();
    calculateRequestsOverview();
    generateRecentActivity();
    
    setLoading(false);
  };

  const calculateSystemStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;
    
    // Calculate total supervisors across all projects
    const allSupervisors = new Set();
    projects.forEach(project => {
      project.supervisors?.forEach(supervisor => {
        allSupervisors.add(supervisor.employeeId || supervisor.id);
      });
    });

    // Calculate total scope work items and progress
    let totalScopeItems = 0;
    let completedScopeItems = 0;
    
    projects.forEach(project => {
      if (project.scopeOfWork) {
        totalScopeItems += project.scopeOfWork.length;
        project.scopeOfWork.forEach(scope => {
          if (scope.done >= scope.total) {
            completedScopeItems++;
          }
        });
      }
    });

    // Calculate all requests
    const allRequests = getAllRequests();
    const pendingRequests = allRequests.filter(r => r.status === 'Pending').length;
    const approvedRequests = allRequests.filter(r => r.status === 'Approved').length;

    setSystemStats({
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalSupervisors: allSupervisors.size,
      totalScopeItems,
      completedScopeItems,
      scopeProgress: totalScopeItems > 0 ? (completedScopeItems / totalScopeItems) * 100 : 0,
      totalRequests: allRequests.length,
      pendingRequests,
      approvedRequests,
      requestsApprovalRate: allRequests.length > 0 ? (approvedRequests / allRequests.length) * 100 : 0
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
      
      // Calculate material and tool counts
      const materialCount = project.materials?.length || 0;
      const toolCount = project.tools?.length || 0;
      const supervisorCount = project.supervisors?.length || 0;
      
      return {
        id: project.id,
        name: project.projectDetails?.projectName || project.projectName || 'Unnamed Project',
        status: project.status || 'Active',
        progress: Math.round(overallProgress),
        supervisors: supervisorCount,
        materials: materialCount,
        tools: toolCount,
        scopeItems: project.scopeOfWork?.length || 0,
        requests: projectRequests.length,
        pendingRequests: projectRequests.filter(r => r.status === 'Pending').length,
        location: project.projectDetails?.location || 'Not specified',
        startDate: project.createdAt,
        priority: project.priority || 'Medium'
      };
    });

    setProjectAnalytics(analytics);
  };

  const calculateMaterialToolStats = () => {
    let totalMaterials = 0;
    let totalTools = 0;
    let totalMaterialRequests = 0;
    let totalToolRequests = 0;
    let approvedMaterialRequests = 0;
    let approvedToolRequests = 0;

    projects.forEach(project => {
      totalMaterials += project.materials?.length || 0;
      totalTools += project.tools?.length || 0;

      const projectRequests = getProjectRequests(project.id);
      const materialRequests = projectRequests.filter(r => r.type === 'Material');
      const toolRequests = projectRequests.filter(r => r.type === 'Tool');
      
      totalMaterialRequests += materialRequests.length;
      totalToolRequests += toolRequests.length;
      approvedMaterialRequests += materialRequests.filter(r => r.status === 'Approved').length;
      approvedToolRequests += toolRequests.filter(r => r.status === 'Approved').length;
    });

    setMaterialToolStats({
      totalMaterials,
      totalTools,
      totalMaterialRequests,
      totalToolRequests,
      approvedMaterialRequests,
      approvedToolRequests,
      materialApprovalRate: totalMaterialRequests > 0 ? (approvedMaterialRequests / totalMaterialRequests) * 100 : 0,
      toolApprovalRate: totalToolRequests > 0 ? (approvedToolRequests / totalToolRequests) * 100 : 0
    });
  };

  const calculateRequestsOverview = () => {
    const allRequests = getAllRequests();
    
    // Group requests by status
    const statusGroups = {
      'Pending': allRequests.filter(r => r.status === 'Pending').length,
      'Approved': allRequests.filter(r => r.status === 'Approved').length,
      'Rejected': allRequests.filter(r => r.status === 'Rejected').length,
      'Mapped': allRequests.filter(r => r.status === 'Mapped').length
    };

    const requestsData = Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count,
      percentage: allRequests.length > 0 ? (count / allRequests.length) * 100 : 0
    }));

    // Group requests by priority
    const priorityGroups = {
      'High': allRequests.filter(r => r.priority === 'High').length,
      'Medium': allRequests.filter(r => r.priority === 'Medium').length,
      'Low': allRequests.filter(r => r.priority === 'Low').length
    };

    const priorityData = Object.entries(priorityGroups).map(([priority, count]) => ({
      priority,
      count
    }));

    setRequestsOverview({ statusData: requestsData, priorityData });
  };

  const generateRecentActivity = () => {
    const activities = [];
    
    // Get recent projects
    projects.slice(0, 3).forEach(project => {
      activities.push({
        type: 'project',
        title: `Project Created: ${project.projectDetails?.projectName || project.projectName}`,
        time: project.createdAt,
        icon: ProjectIcon,
        color: 'primary'
      });
    });

    // Get recent requests
    const allRequests = getAllRequests();
    allRequests.slice(0, 5).forEach(request => {
      activities.push({
        type: 'request',
        title: `${request.type} Request: ${request.materialName}`,
        subtitle: `Project: ${request.projectName} - Status: ${request.status}`,
        time: request.requestDate,
        icon: request.type === 'Material' ? MaterialIcon : ToolIcon,
        color: request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'
      });
    });

    // Sort by time and take most recent
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivity(activities.slice(0, 10));
  };

  const getAllRequests = () => {
    const allRequests = [];
    projects.forEach(project => {
      const requests = getProjectRequests(project.id);
      allRequests.push(...requests.map(req => ({
        ...req,
        projectName: project.projectDetails?.projectName || project.projectName
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

  // Project status distribution data for display
  const projectStatusData = useMemo(() => [
    { name: 'Active', value: systemStats.activeProjects || 0, color: '#4caf50' },
    { name: 'Completed', value: systemStats.completedProjects || 0, color: '#2196f3' },
    { name: 'On Hold', value: systemStats.onHoldProjects || 0, color: '#ff9800' }
  ], [systemStats]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading SuperAdmin Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              SuperAdmin Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Complete overview of all projects, materials, tools, and system activity
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={calculateAllStatistics}
            sx={{ color: 'primary.main' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.totalProjects || 0}
                  </Typography>
                  <Typography variant="subtitle1">Total Projects</Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemStats.activeProjects ? (systemStats.activeProjects / systemStats.totalProjects) * 100 : 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {systemStats.activeProjects || 0} Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.totalSupervisors || 0}
                  </Typography>
                  <Typography variant="subtitle1">Supervisors</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Across {systemStats.totalProjects || 0} projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {Math.round(systemStats.scopeProgress || 0)}%
                  </Typography>
                  <Typography variant="subtitle1">Overall Progress</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemStats.scopeProgress || 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {systemStats.completedScopeItems || 0} of {systemStats.totalScopeItems || 0} scope items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.pendingRequests || 0}
                  </Typography>
                  <Typography variant="subtitle1">Pending Requests</Typography>
                </Box>
                <Badge badgeContent={systemStats.pendingRequests || 0} color="error">
                  <RequestIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Badge>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {Math.round(systemStats.requestsApprovalRate || 0)}% approval rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row - Using simple visual representations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Project Status Distribution
            </Typography>
            <Box sx={{ mt: 4 }}>
              {projectStatusData.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: item.color, 
                          borderRadius: '50%' 
                        }} 
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value} ({Math.round((item.value / (systemStats.totalProjects || 1)) * 100)}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.value / (systemStats.totalProjects || 1)) * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Request Status Overview
            </Typography>
            <Box sx={{ mt: 4 }}>
              {requestsOverview.statusData?.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">{item.status}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.count} ({Math.round(item.percentage)}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.percentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      item.status === 'Approved' ? 'success' :
                      item.status === 'Pending' ? 'warning' :
                      item.status === 'Rejected' ? 'error' : 'info'
                    }
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Material & Tool Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              All Projects Overview
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Project</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Progress</strong></TableCell>
                    <TableCell align="center"><strong>Supervisors</strong></TableCell>
                    <TableCell align="center"><strong>Materials</strong></TableCell>
                    <TableCell align="center"><strong>Tools</strong></TableCell>
                    <TableCell align="center"><strong>Requests</strong></TableCell>
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
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mx: 'auto' }}>
                          {project.supervisors}
                        </Avatar>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={project.materials} 
                          color="info" 
                          size="small" 
                          icon={<MaterialIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={project.tools} 
                          color="secondary" 
                          size="small" 
                          icon={<ToolIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={project.pendingRequests} color="warning">
                          <Chip 
                            label={project.requests} 
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

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent System Activity
            </Typography>
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
              {recentActivity.map((activity, index) => {
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
                          {activity.subtitle && (
                            <Typography variant="caption" display="block">
                              {activity.subtitle}
                            </Typography>
                          )}
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

      {/* Material & Tool Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Material Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {materialToolStats.totalMaterials || 0}
                  </Typography>
                  <Typography variant="body2">Total Materials</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {materialToolStats.totalMaterialRequests || 0}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={materialToolStats.materialApprovalRate || 0} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {Math.round(materialToolStats.materialApprovalRate || 0)}% Approval Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tool Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {materialToolStats.totalTools || 0}
                  </Typography>
                  <Typography variant="body2">Total Tools</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight={700}>
                    {materialToolStats.totalToolRequests || 0}
                  </Typography>
                  <Typography variant="body2">Total Requests</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={materialToolStats.toolApprovalRate || 0} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {Math.round(materialToolStats.toolApprovalRate || 0)}% Approval Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SuperAdminHome;