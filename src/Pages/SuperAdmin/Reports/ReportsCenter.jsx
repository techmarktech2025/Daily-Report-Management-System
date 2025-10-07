// src/Pages/SuperAdmin/Reports/ReportsCenter.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
  TrendingUp as TrendingUpIcon,
  Business as ProjectIcon,
  People as UsersIcon,
  Inventory as MaterialIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const ReportsCenter = () => {
  const { projects } = useProject();
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    generateReportsData();
  }, [projects]);

  const generateReportsData = () => {
    // Generate comprehensive report data
    const projectReports = projects.map(project => {
      let overallProgress = 0;
      if (project.scopeOfWork && project.scopeOfWork.length > 0) {
        const totalWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.total || 0), 0);
        const completedWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.done || 0), 0);
        overallProgress = totalWork > 0 ? (completedWork / totalWork) * 100 : 0;
      }

      const projectRequests = getProjectRequests(project.id);
      
      return {
        id: project.id,
        name: project.projectDetails?.projectName || project.projectName || 'Unnamed Project',
        status: project.status || 'Active',
        progress: Math.round(overallProgress),
        supervisors: project.supervisors?.length || 0,
        materials: project.materials?.length || 0,
        tools: project.tools?.length || 0,
        requests: projectRequests.length,
        pendingRequests: projectRequests.filter(r => r.status === 'Pending').length,
        startDate: project.createdAt,
        location: project.projectDetails?.location || 'Not specified'
      };
    });

    // Performance metrics
    const performanceMetrics = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      avgProgress: projectReports.length > 0 
        ? Math.round(projectReports.reduce((sum, p) => sum + p.progress, 0) / projectReports.length)
        : 0,
      totalSupervisors: new Set(projects.flatMap(p => p.supervisors?.map(s => s.employeeId) || [])).size,
      totalRequests: projectReports.reduce((sum, p) => sum + p.requests, 0),
      totalPendingRequests: projectReports.reduce((sum, p) => sum + p.pendingRequests, 0)
    };

    // Resource utilization
    const resourceUtilization = {
      totalMaterials: projects.reduce((sum, p) => sum + (p.materials?.length || 0), 0),
      totalTools: projects.reduce((sum, p) => sum + (p.tools?.length || 0), 0),
      materialRequestRate: 0,
      toolRequestRate: 0
    };

    setReportData({
      projectReports,
      performanceMetrics,
      resourceUtilization,
      generatedAt: new Date().toISOString()
    });
  };

  const getProjectRequests = (projectId) => {
    const stored = localStorage.getItem(`requests_${projectId}`);
    return stored ? JSON.parse(stored) : [];
  };

  const handleDownloadReport = (reportType) => {
    // Mock download functionality
    console.log(`Downloading ${reportType} report...`);
    // In real implementation, this would generate and download actual reports
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'info';
      case 'On Hold': return 'warning';
      default: return 'default';
    }
  };

  const availableReports = [
    {
      id: 'project_summary',
      title: 'Project Summary Report',
      description: 'Complete overview of all projects with progress and status',
      type: 'PDF',
      icon: ProjectIcon,
      lastGenerated: new Date().toLocaleDateString()
    },
    {
      id: 'performance_analytics',
      title: 'Performance Analytics',
      description: 'System-wide performance metrics and trends analysis',
      type: 'Excel',
      icon: TrendingUpIcon,
      lastGenerated: new Date().toLocaleDateString()
    },
    {
      id: 'resource_utilization',
      title: 'Resource Utilization Report',
      description: 'Materials and tools usage across all projects',
      type: 'PDF',
      icon: MaterialIcon,
      lastGenerated: new Date().toLocaleDateString()
    },
    {
      id: 'user_activity',
      title: 'User Activity Report',
      description: 'Supervisor activities, login patterns, and productivity',
      type: 'Excel',
      icon: UsersIcon,
      lastGenerated: new Date().toLocaleDateString()
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Reports Center
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Generate and download comprehensive system reports
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Report Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {reportData.performanceMetrics?.totalProjects || 0}
            </Typography>
            <Typography variant="body2">Total Projects</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {reportData.performanceMetrics?.avgProgress || 0}%
            </Typography>
            <Typography variant="body2">Average Progress</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {reportData.performanceMetrics?.totalSupervisors || 0}
            </Typography>
            <Typography variant="body2">Active Supervisors</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {reportData.performanceMetrics?.totalPendingRequests || 0}
            </Typography>
            <Typography variant="body2">Pending Requests</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Available Reports */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Reports
        </Typography>
        <Grid container spacing={3}>
          {availableReports.map((report) => {
            const IconComponent = report.icon;
            return (
              <Grid item xs={12} sm={6} md={6} key={report.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <IconComponent sx={{ fontSize: 32, color: 'primary.main', mt: 0.5 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {report.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {report.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={report.type} color="primary" size="small" />
                            <Chip label={`Updated: ${report.lastGenerated}`} variant="outlined" size="small" />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" title="View Report">
                              <ViewIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              title="Download Report"
                              onClick={() => handleDownloadReport(report.id)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Recent Reports Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Performance Overview
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Project</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Progress</strong></TableCell>
                <TableCell align="center"><strong>Team</strong></TableCell>
                <TableCell align="center"><strong>Resources</strong></TableCell>
                <TableCell align="center"><strong>Requests</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.projectReports?.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Started: {new Date(project.startDate).toLocaleDateString()}
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
                    <Typography variant="body2">
                      {project.supervisors} supervisors
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Chip 
                        label={`${project.materials}M`} 
                        color="info" 
                        size="small" 
                        title="Materials"
                      />
                      <Chip 
                        label={`${project.tools}T`} 
                        color="secondary" 
                        size="small" 
                        title="Tools"
                      />
                    </Box>
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
                  <TableCell>
                    <Typography variant="body2">
                      {project.location}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ReportsCenter;