// src/Pages/Supervisor/SupervisorHome/SupervisorHome.jsx
import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Schedule as AttendanceIcon,
  Assignment as ScopeIcon,
  Engineering as WorkProgressIcon,
  Inventory as MaterialIcon,
  People as PeopleIcon,
  TrendingUp as TrendIcon
} from '@mui/icons-material';

// Mock data for dashboard widgets
const dashboardData = {
  todayAttendance: { present: 45, total: 50, percentage: 90 },
  workProgress: { completed: 65, total: 100, percentage: 65 },
  pendingRequests: { material: 5, tool: 3 },
  recentActivities: [
    { type: 'Challan Received', item: 'Cement - 50 bags', time: '2 hours ago' },
    { type: 'Work Completed', item: 'Foundation Work - East Side', time: '4 hours ago' },
    { type: 'Material Request', item: 'Steel Rods - 100 pieces', time: '6 hours ago' }
  ]
};

const SupervisorHome = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
          Supervisor Home Page
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back! Here's your project overview for today.
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Today's Attendance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttendanceIcon sx={{ color: '#4caf50', mr: 2, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Attendance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.todayAttendance.present}/{dashboardData.todayAttendance.total}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.todayAttendance.percentage} 
                sx={{ mb: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary">
                {dashboardData.todayAttendance.percentage}% Present Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkProgressIcon sx={{ color: '#2196f3', mr: 2, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Work Progress
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.workProgress.percentage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.workProgress.percentage}
                sx={{ mb: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary">
                {dashboardData.workProgress.completed} of {dashboardData.workProgress.total} tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MaterialIcon sx={{ color: '#ff9800', mr: 2, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Requests
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData.pendingRequests.material + dashboardData.pendingRequests.tool}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={`${dashboardData.pendingRequests.material} Material`} size="small" color="primary" />
                <Chip label={`${dashboardData.pendingRequests.tool} Tool`} size="small" color="secondary" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Size */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: '#9c27b0', mr: 2, fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Team Size
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                50
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                  +5 this week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Activities
            </Typography>
            <Box>
              {dashboardData.recentActivities.map((activity, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    borderBottom: index < dashboardData.recentActivities.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {activity.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.item}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Mark Attendance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Record today's attendance
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Request Material
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit new material request
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Update Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Log work completion
                </Typography>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SupervisorHome;
