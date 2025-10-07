// src/Pages/Supervisor/Settings/SupervisorSettings.jsx
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
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  SupervisorAccount as SupervisorIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Assignment as ProjectIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useProject } from '../../../contexts/ProjectContext';

const SupervisorSettings = () => {
  const { user } = useAuth();
  const { getProjectBySupervisor } = useProject();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [profileData, setProfileData] = useState({});
  const [workSettings, setWorkSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [project, setProject] = useState(null);

  useEffect(() => {
    loadSettings();
    loadProjectData();
  }, []);

  const loadProjectData = () => {
    if (user && user.employeeId) {
      const supervisorProject = getProjectBySupervisor(user.employeeId);
      setProject(supervisorProject);
    }
  };

  const loadSettings = () => {
    // Load Supervisor settings from localStorage
    const settingsKey = `supervisor_settings_${user?.employeeId || user?.id}`;
    const storedSettings = localStorage.getItem(settingsKey);
    const defaultSettings = {
      profile: {
        name: user?.name || 'Supervisor',
        employeeId: user?.employeeId || 'SUP001',
        email: user?.email || 'supervisor@company.com',
        phone: '+91 9876543210',
        avatar: null,
        timezone: 'Asia/Kolkata',
        language: 'English',
        theme: 'light',
        department: 'Construction',
        experience: '5 years'
      },
      work: {
        workingHours: '9 AM - 6 PM',
        weekendWork: false,
        overtimeNotifications: true,
        autoSubmitReports: false,
        dailyReportTime: '18:00',
        progressUpdateFrequency: 'daily',
        materialRequestLimit: 10,
        toolRequestLimit: 5
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        adminMessages: true,
        requestStatusUpdates: true,
        dailyReminders: true,
        weeklyReports: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 120,
        autoLogout: false,
        changePasswordReminder: true
      }
    };

    const loadedSettings = storedSettings ? 
      { ...defaultSettings, ...JSON.parse(storedSettings) } : 
      defaultSettings;

    setSettings(loadedSettings);
    setProfileData(loadedSettings.profile);
    setWorkSettings(loadedSettings.work);
  };

  const saveSettings = () => {
    const updatedSettings = {
      ...settings,
      profile: profileData,
      work: workSettings,
      lastModified: new Date().toISOString(),
      modifiedBy: user?.name || 'Supervisor'
    };

    const settingsKey = `supervisor_settings_${user?.employeeId || user?.id}`;
    localStorage.setItem(settingsKey, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    setSaveStatus('✅ Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkChange = (field, value) => {
    setWorkSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  const calculateProjectProgress = () => {
    if (!project || !project.scopeOfWork) return 0;
    
    const totalWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.total || 0), 0);
    const completedWork = project.scopeOfWork.reduce((sum, scope) => sum + (scope.done || 0), 0);
    
    return totalWork > 0 ? Math.round((completedWork / totalWork) * 100) : 0;
  };

  const tabs = [
    { label: 'Profile', icon: PersonIcon },
    { label: 'Work Settings', icon: WorkIcon },
    { label: 'Security', icon: SecurityIcon },
    { label: 'Notifications', icon: NotificationsIcon }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'success.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Supervisor Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Personal preferences and work configuration
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip 
              icon={<SupervisorIcon />}
              label={`Supervisor - ${user?.employeeId}`} 
              color="success" 
              sx={{ mr: 2 }} 
            />
          </Box>
        </Box>

        {saveStatus && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {saveStatus}
          </Alert>
        )}

        {/* Current Project Info */}
        {project && (
          <Card sx={{ mt: 2, p: 2, backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Current Project: {project.projectDetails?.projectName || project.projectName}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Location:</strong> {project.projectDetails?.location || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Progress:</strong> {calculateProjectProgress()}%
                </Typography>
              </Grid>
            </Grid>
            <LinearProgress 
              variant="determinate" 
              value={calculateProjectProgress()} 
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Card>
        )}
      </Paper>

      {/* Settings Tabs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <Tab
                    key={index}
                    icon={<IconComponent />}
                    iconPosition="start"
                    label={tab.label}
                    sx={{ 
                      alignItems: 'flex-start', 
                      textAlign: 'left',
                      minHeight: 60
                    }}
                  />
                );
              })}
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {/* Profile Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Supervisor Profile
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Avatar
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mx: 'auto', 
                          mb: 2,
                          bgcolor: 'success.main',
                          fontSize: '3rem'
                        }}
                      >
                        {profileData.name?.charAt(0) || 'S'}
                      </Avatar>
                      <Button variant="outlined" component="label">
                        Change Avatar
                        <input type="file" hidden accept="image/*" />
                      </Button>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        {profileData.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID: {profileData.employeeId}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={profileData.name || ''}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Employee ID"
                          value={profileData.employeeId || ''}
                          disabled
                          helperText="Employee ID cannot be changed"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={profileData.email || ''}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={profileData.phone || ''}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Department"
                          value={profileData.department || ''}
                          onChange={(e) => handleProfileChange('department', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Experience"
                          value={profileData.experience || ''}
                          onChange={(e) => handleProfileChange('experience', e.target.value)}
                          helperText="e.g., '5 years' or '3 years in construction'"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Timezone</InputLabel>
                          <Select
                            value={profileData.timezone || 'Asia/Kolkata'}
                            onChange={(e) => handleProfileChange('timezone', e.target.value)}
                            label="Timezone"
                          >
                            <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                            <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                            <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={profileData.language || 'English'}
                            onChange={(e) => handleProfileChange('language', e.target.value)}
                            label="Language"
                          >
                            <MenuItem value="English">English</MenuItem>
                            <MenuItem value="Hindi">हिंदी</MenuItem>
                            <MenuItem value="Marathi">मराठी</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Work Settings Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Work Configuration
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Weekend Work"
                          secondary="Enable work reporting on weekends"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={workSettings.weekendWork || false}
                            onChange={(e) => handleWorkChange('weekendWork', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemText
                          primary="Overtime Notifications"
                          secondary="Get notified about overtime work"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={workSettings.overtimeNotifications !== false}
                            onChange={(e) => handleWorkChange('overtimeNotifications', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemText
                          primary="Auto-submit Reports"
                          secondary="Automatically submit daily reports at scheduled time"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={workSettings.autoSubmitReports || false}
                            onChange={(e) => handleWorkChange('autoSubmitReports', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Working Hours"
                          value={workSettings.workingHours || ''}
                          onChange={(e) => handleWorkChange('workingHours', e.target.value)}
                          placeholder="e.g., 9 AM - 6 PM"
                          InputProps={{
                            startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Daily Report Time"
                          type="time"
                          value={workSettings.dailyReportTime || '18:00'}
                          onChange={(e) => handleWorkChange('dailyReportTime', e.target.value)}
                          helperText="Preferred time for daily report submission"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Progress Update Frequency</InputLabel>
                          <Select
                            value={workSettings.progressUpdateFrequency || 'daily'}
                            onChange={(e) => handleWorkChange('progressUpdateFrequency', e.target.value)}
                            label="Progress Update Frequency"
                          >
                            <MenuItem value="realtime">Real-time</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Material Request Limit (per day)"
                          type="number"
                          value={workSettings.materialRequestLimit || 10}
                          onChange={(e) => handleWorkChange('materialRequestLimit', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tool Request Limit (per day)"
                          type="number"
                          value={workSettings.toolRequestLimit || 5}
                          onChange={(e) => handleWorkChange('toolRequestLimit', parseInt(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Enable 2FA for your account"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.security?.twoFactorAuth || false}
                            onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemText
                          primary="Auto Logout"
                          secondary="Automatically logout after session timeout"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.security?.autoLogout || false}
                            onChange={(e) => handleSecurityChange('autoLogout', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemText
                          primary="Password Change Reminders"
                          secondary="Get reminders to change password"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.security?.changePasswordReminder !== false}
                            onChange={(e) => handleSecurityChange('changePasswordReminder', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Session Timeout (minutes)"
                          type="number"
                          value={settings.security?.sessionTimeout || 120}
                          onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                          helperText="Session will timeout after this duration of inactivity"
                        />
                      </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Security Recommendation</Typography>
                      <Typography variant="body2">
                        Enable two-factor authentication and use a strong password for better security.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notifications Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.emailNotifications !== false}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText
                      primary="SMS Notifications"
                      secondary="Receive critical alerts via SMS"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.smsNotifications || false}
                        onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><ProjectIcon /></ListItemIcon>
                    <ListItemText
                      primary="Project Updates"
                      secondary="Admin messages and project changes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.projectUpdates !== false}
                        onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText
                      primary="Admin Messages"
                      secondary="Important messages from administrators"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.adminMessages !== false}
                        onChange={(e) => handleNotificationChange('adminMessages', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText
                      primary="Request Status Updates"
                      secondary="Material and tool request approvals/rejections"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.requestStatusUpdates !== false}
                        onChange={(e) => handleNotificationChange('requestStatusUpdates', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Daily Reminders"
                      secondary="Daily report submission reminders"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.dailyReminders !== false}
                        onChange={(e) => handleNotificationChange('dailyReminders', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Weekly Reports"
                      secondary="Receive weekly progress summary"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.weeklyReports || false}
                        onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button 
                variant="outlined" 
                onClick={() => loadSettings()}
                startIcon={<ResetIcon />}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                onClick={saveSettings}
                startIcon={<SaveIcon />}
              >
                Save Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SupervisorSettings;