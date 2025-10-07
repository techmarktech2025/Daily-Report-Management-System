// src/Pages/SuperAdmin/Analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const AnalyticsDashboard = () => {
  const { projects } = useProject();
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    calculateAnalytics();
  }, [projects]);

  const calculateAnalytics = () => {
    // Calculate comprehensive analytics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    // Calculate overall progress
    let totalProgress = 0;
    let totalMaterials = 0;
    let totalTools = 0;
    let totalSupervisors = new Set();
    let totalRequests = 0;

    projects.forEach(project => {
      // Calculate project progress
      if (project.scopeOfWork && project.scopeOfWork.length > 0) {
        const totalWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.total || 0), 0);
        const completedWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.done || 0), 0);
        if (totalWork > 0) {
          totalProgress += (completedWork / totalWork) * 100;
        }
      }

      // Count resources
      totalMaterials += project.materials?.length || 0;
      totalTools += project.tools?.length || 0;

      // Count unique supervisors
      project.supervisors?.forEach(supervisor => {
        totalSupervisors.add(supervisor.employeeId || supervisor.id);
      });

      // Count requests
      const projectRequests = localStorage.getItem(`requests_${project.id}`);
      if (projectRequests) {
        totalRequests += JSON.parse(projectRequests).length;
      }
    });

    const avgProgress = totalProjects > 0 ? totalProgress / totalProjects : 0;

    setAnalytics({
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress: Math.round(avgProgress),
      totalMaterials,
      totalTools,
      totalSupervisors: totalSupervisors.size,
      totalRequests,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      activeRate: totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Analytics & Insights
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive system analytics and performance metrics
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {analytics.totalProjects || 0}
                  </Typography>
                  <Typography variant="subtitle1">Total Projects</Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={analytics.completionRate || 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {Math.round(analytics.completionRate || 0)}% Completion Rate
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
                    {analytics.avgProgress || 0}%
                  </Typography>
                  <Typography variant="subtitle1">Average Progress</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={analytics.avgProgress || 0} 
                sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Across all active projects
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
                    {analytics.totalSupervisors || 0}
                  </Typography>
                  <Typography variant="subtitle1">Active Supervisors</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Managing {analytics.activeProjects || 0} active projects
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
                    {analytics.totalRequests || 0}
                  </Typography>
                  <Typography variant="subtitle1">Total Requests</Typography>
                </Box>
                <MaterialIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Materials & Tools requested
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resource Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Materials</Typography>
                  <Typography variant="body2">{analytics.totalMaterials || 0}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.totalMaterials > 0 ? 70 : 0} 
                  sx={{ mb: 2, height: 6 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tools</Typography>
                  <Typography variant="body2">{analytics.totalTools || 0}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.totalTools > 0 ? 60 : 0} 
                  color="secondary"
                  sx={{ height: 6 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Status Breakdown
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: 'success.main', borderRadius: '50%' }} />
                    <Typography variant="body2">Active</Typography>
                  </Box>
                  <Chip label={analytics.activeProjects || 0} color="success" size="small" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: 'info.main', borderRadius: '50%' }} />
                    <Typography variant="body2">Completed</Typography>
                  </Box>
                  <Chip label={analytics.completedProjects || 0} color="info" size="small" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: 'primary.main', borderRadius: '50%' }} />
                    <Typography variant="body2">Total</Typography>
                  </Box>
                  <Chip label={analytics.totalProjects || 0} color="primary" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Insights */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                {Math.round(analytics.activeRate || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects Currently Active
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight={600}>
                {Math.round(analytics.completionRate || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Completion Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary.main" fontWeight={600}>
                {analytics.totalSupervisors > 0 ? Math.round(analytics.totalProjects / analytics.totalSupervisors) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Projects per Supervisor
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard;