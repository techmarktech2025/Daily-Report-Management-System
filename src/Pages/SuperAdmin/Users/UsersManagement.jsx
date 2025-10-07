// src/Pages/SuperAdmin/Users/UsersManagement.jsx
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
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import {
  People as UsersIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  PersonAdd as AddUserIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as ProjectIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const UsersManagement = () => {
  const { projects } = useProject();
  const [users, setUsers] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadSystemUsers();
  }, [projects]);

  const loadSystemUsers = () => {
    // Extract users from projects and system
    const systemUsers = [];
    const uniqueUsers = new Set();

    // Add system admins (mock data - in real app, this would come from user management API)
    const systemAdmins = [
      {
        id: 0,
        name: 'Super Administrator',
        email: 'superadmin@techmark.tech',
        role: 'superadmin',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        permissions: ['Full System Access'],
        projectsAssigned: projects.length,
        createdAt: '2024-01-01'
      },
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        status: 'Active',
        lastLogin: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        permissions: ['Project Management', 'User Management'],
        projectsAssigned: projects.length,
        createdAt: '2024-01-15'
      }
    ];

    systemAdmins.forEach(admin => {
      if (!uniqueUsers.has(admin.email)) {
        systemUsers.push(admin);
        uniqueUsers.add(admin.email);
      }
    });

    // Extract supervisors from projects
    projects.forEach(project => {
      project.supervisors?.forEach(supervisor => {
        const userKey = supervisor.email || supervisor.employeeId;
        
        if (!uniqueUsers.has(userKey)) {
          // Get supervisor confirmation status
          const confirmationStatus = supervisor.needsConfirmation ? 'Pending Confirmation' : 'Confirmed';
          
          // Count projects for this supervisor
          const supervisorProjects = projects.filter(p => 
            p.supervisors?.some(s => 
              s.employeeId === supervisor.employeeId || s.email === supervisor.email
            )
          ).length;

          systemUsers.push({
            id: supervisor.employeeId || `SUP-${Date.now()}`,
            name: supervisor.name || 'Unknown Supervisor',
            email: supervisor.email || `${supervisor.employeeId}@company.com`,
            role: 'supervisor',
            employeeId: supervisor.employeeId,
            status: supervisor.needsConfirmation ? 'Pending' : 'Active',
            confirmationStatus: confirmationStatus,
            lastLogin: supervisor.lastLogin || null,
            projectsAssigned: supervisorProjects,
            currentProject: project.projectDetails?.projectName || project.projectName,
            permissions: ['Project Execution', 'Request Submission'],
            createdAt: supervisor.addedAt || project.createdAt || new Date().toISOString()
          });
          
          uniqueUsers.add(userKey);
        }
      });
    });

    setUsers(systemUsers);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <SecurityIcon color="error" />;
      case 'admin':
        return <AdminIcon color="primary" />;
      case 'supervisor':
        return <SupervisorIcon color="success" />;
      default:
        return <UsersIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'primary';
      case 'supervisor':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  // Calculate user statistics
  const userStats = {
    total: users.length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    active: users.filter(u => u.status === 'Active').length,
    pending: users.filter(u => u.status === 'Pending').length
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UsersIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Users Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage system users, roles, and permissions across all projects
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddUserIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Add New User
          </Button>
        </Box>
      </Paper>

      {/* User Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="primary" fontWeight={700}>
              {userStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="h3" color="error.main" fontWeight={700}>
              {userStats.superadmins}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SuperAdmins
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h3" color="primary.main" fontWeight={700}>
              {userStats.admins}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admins
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {userStats.supervisors}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supervisors
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e5f5' }}>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {userStats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="h3" color="warning.main" fontWeight={700}>
              {userStats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Projects</strong></TableCell>
              <TableCell><strong>Last Login</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${getRoleColor(user.role)}.main` }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                      {user.employeeId && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          ID: {user.employeeId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRoleIcon(user.role)}
                    <Chip 
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                      color={getRoleColor(user.role)} 
                      size="small" 
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    color={getStatusColor(user.status)} 
                    size="small" 
                  />
                  {user.confirmationStatus && user.confirmationStatus !== 'Confirmed' && (
                    <Chip 
                      label={user.confirmationStatus} 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Badge badgeContent={user.projectsAssigned} color="primary">
                    <ProjectIcon />
                  </Badge>
                  {user.currentProject && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Current: {user.currentProject.substring(0, 20)}...
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </Typography>
                  {user.lastLogin && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(user.lastLogin).toLocaleTimeString()}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.permissions.slice(0, 2).map((permission, idx) => (
                      <Chip 
                        key={idx}
                        label={permission} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                    {user.permissions.length > 2 && (
                      <Chip 
                        label={`+${user.permissions.length - 2}`} 
                        size="small" 
                        color="primary"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewUser(user)}
                    title="View Details"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small" title="Edit User">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Details Dialog */}
      <Dialog 
        open={showUserDialog} 
        onClose={() => setShowUserDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          User Details - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>User Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>{getRoleIcon(selectedUser.role)}</ListItemIcon>
                      <ListItemText 
                        primary="Role" 
                        secondary={
                          <Chip 
                            label={selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)} 
                            color={getRoleColor(selectedUser.role)} 
                            size="small" 
                          />
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Email" secondary={selectedUser.email} />
                    </ListItem>
                    {selectedUser.employeeId && (
                      <ListItem>
                        <ListItemText primary="Employee ID" secondary={selectedUser.employeeId} />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <Chip 
                            label={selectedUser.status} 
                            color={getStatusColor(selectedUser.status)} 
                            size="small" 
                          />
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Created" 
                        secondary={new Date(selectedUser.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Access & Permissions</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><ProjectIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Projects Assigned" 
                        secondary={selectedUser.projectsAssigned} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Last Login" 
                        secondary={selectedUser.lastLogin 
                          ? new Date(selectedUser.lastLogin).toLocaleString() 
                          : 'Never logged in'
                        } 
                      />
                    </ListItem>
                    {selectedUser.currentProject && (
                      <ListItem>
                        <ListItemText 
                          primary="Current Project" 
                          secondary={selectedUser.currentProject} 
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Permissions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedUser.permissions.map((permission, idx) => (
                      <Chip 
                        key={idx}
                        label={permission} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          <Button variant="contained">Edit User</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersManagement;