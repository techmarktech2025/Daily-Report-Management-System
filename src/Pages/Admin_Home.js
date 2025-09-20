// src/Pages/Admin_Home.jsx
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
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  TrendingUp as TrendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// Mock data for admin dashboard
const adminDashboardData = {
  totalProjects: { count: 12, active: 8, completed: 4 },
  totalEmployees: { count: 120, supervisors: 15, workers: 105 },
  materialRequests: { total: 25, pending: 8, approved: 12, rejected: 5 },
  toolRequests: { total: 18, pending: 5, approved: 10, rejected: 3 },
  recentActivities: [
    {
      type: 'Project Created',
      description: 'Project Delta - Mumbai Site 3',
      time: '2 hours ago',
      icon: ProjectIcon,
      color: '#4caf50'
    },
    {
      type: 'Material Request',
      description: 'Cement - 100 bags requested by Rajesh Kumar',
      time: '4 hours ago',
      icon: MaterialIcon,
      color: '#2196f3'
    },
    {
      type: 'Employee Added',
      description: 'New supervisor: Priya Sharma added',
      time: '6 hours ago',
      icon: PeopleIcon,
      color: '#ff9800'
    },
    {
      type: 'Challan Completed',
      description: 'Steel rods delivered to Project Alpha',
      time: '8 hours ago',
      icon: CheckIcon,
      color: '#4caf50'
    }
  ],
  urgentTasks: [
    { task: 'Approve 5 pending material requests', priority: 'High' },
    { task: 'Review Project Beta progress report', priority: 'Medium' },
    { task: 'Assign supervisor to new project', priority: 'High' },
    { task: 'Update inventory stock levels', priority: 'Low' }
  ]
};

const AdminHome = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back! Here's your system overview for today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Total Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4} 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ProjectIcon sx={{ fontSize: 35, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Projects
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {adminDashboardData.totalProjects.count}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={`${adminDashboardData.totalProjects.active} Active`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${adminDashboardData.totalProjects.completed} Completed`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  +2 this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Employees */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 35, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Employees
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {adminDashboardData.totalEmployees.count}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={`${adminDashboardData.totalEmployees.supervisors} Supervisors`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${adminDashboardData.totalEmployees.workers} Workers`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  +8 this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Material Requests */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MaterialIcon sx={{ fontSize: 35, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Material Requests
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {adminDashboardData.materialRequests.total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${adminDashboardData.materialRequests.pending} Pending`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${adminDashboardData.materialRequests.approved} Approved`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              {adminDashboardData.materialRequests.pending > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {adminDashboardData.materialRequests.pending} need attention
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tool Requests */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ToolIcon sx={{ fontSize: 35, mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tool Requests
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {adminDashboardData.toolRequests.total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${adminDashboardData.toolRequests.pending} Pending`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${adminDashboardData.toolRequests.approved} Approved`} 
                  size="small" 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              {adminDashboardData.toolRequests.pending > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {adminDashboardData.toolRequests.pending} need attention
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        
        {/* Recent Activities */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={4} sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Activities
              </Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>
            <List>
              {adminDashboardData.recentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: activity.color }}>
                          <IconComponent />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {activity.type}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < adminDashboardData.recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions & Urgent Tasks */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ProjectIcon />}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1.5 }}
                  >
                    Create New Project
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1.5 }}
                  >
                    Add Employee
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MaterialIcon />}
                    fullWidth
                    sx={{ textTransform: 'none', py: 1.5 }}
                  >
                    Review Requests
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Urgent Tasks */}
            <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Urgent Tasks
                </Typography>
                <List dense>
                  {adminDashboardData.urgentTasks.map((task, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={task.task}
                        secondary={
                          <Chip
                            label={task.priority}
                            size="small"
                            color={
                              task.priority === 'High' ? 'error' :
                              task.priority === 'Medium' ? 'warning' : 'success'
                            }
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminHome;
