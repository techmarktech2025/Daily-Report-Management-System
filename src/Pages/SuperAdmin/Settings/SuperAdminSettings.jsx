// src/Pages/SuperAdmin/Settings/SuperAdminSettings.jsx
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
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const SuperAdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [profileData, setProfileData] = useState({});
  const [systemConfig, setSystemConfig] = useState({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load SuperAdmin settings from localStorage
    const storedSettings = localStorage.getItem('superadmin_settings');
    const defaultSettings = {
      profile: {
        name: user?.name || 'Super Administrator',
        email: user?.email || 'superadmin@techmark.tech',
        phone: '+91 9876543210',
        avatar: null,
        timezone: 'Asia/Kolkata',
        language: 'English',
        theme: 'light'
      },
      system: {
        autoBackup: true,
        backupFrequency: 'daily',
        maintenanceMode: false,
        debugLogging: false,
        maxProjects: 100,
        maxUsersPerProject: 50,
        sessionTimeout: 30,
        dataRetentionDays: 365
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        systemAlerts: true,
        projectUpdates: true,
        userActivities: false,
        securityAlerts: true
      },
      security: {
        twoFactorAuth: false,
        passwordPolicy: 'medium',
        sessionSecurity: 'high',
        apiRateLimit: 1000,
        loginAttempts: 5,
        accountLockTime: 30
      }
    };

    const loadedSettings = storedSettings ? 
      { ...defaultSettings, ...JSON.parse(storedSettings) } : 
      defaultSettings;

    setSettings(loadedSettings);
    setProfileData(loadedSettings.profile);
    setSystemConfig(loadedSettings.system);
  };

  const saveSettings = () => {
    const updatedSettings = {
      ...settings,
      profile: profileData,
      system: systemConfig,
      lastModified: new Date().toISOString(),
      modifiedBy: user?.name || 'SuperAdmin'
    };

    localStorage.setItem('superadmin_settings', JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    setSaveStatus('✅ Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('superadmin_settings');
    loadSettings();
    setSaveStatus('🔄 Settings reset to defaults!');
    setTimeout(() => setSaveStatus(''), 3000);
    setShowResetDialog(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `superadmin-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemChange = (field, value) => {
    setSystemConfig(prev => ({
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

  const tabs = [
    { label: 'Profile', icon: PersonIcon },
    { label: 'System Config', icon: SettingsIcon },
    { label: 'Security', icon: SecurityIcon },
    { label: 'Notifications', icon: NotificationsIcon },
    { label: 'Data & Backup', icon: StorageIcon }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'error.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              SuperAdmin Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              System configuration and administrative settings
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip 
              icon={<SuperAdminIcon />}
              label="Super Administrator" 
              color="error" 
              sx={{ mr: 2 }} 
            />
          </Box>
        </Box>

        {saveStatus && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {saveStatus}
          </Alert>
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
                  Profile Settings
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
                          bgcolor: 'error.main',
                          fontSize: '3rem'
                        }}
                      >
                        {profileData.name?.charAt(0) || 'S'}
                      </Avatar>
                      <Button variant="outlined" component="label">
                        Change Avatar
                        <input type="file" hidden accept="image/*" />
                      </Button>
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
                          label="Email Address"
                          type="email"
                          value={profileData.email || ''}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={profileData.phone || ''}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
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
                            <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
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
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Theme</InputLabel>
                          <Select
                            value={profileData.theme || 'light'}
                            onChange={(e) => handleProfileChange('theme', e.target.value)}
                            label="Theme"
                          >
                            <MenuItem value="light">Light Mode</MenuItem>
                            <MenuItem value="dark">Dark Mode</MenuItem>
                            <MenuItem value="auto">Auto (System)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* System Configuration Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  System Configuration
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Automatic Backup"
                          secondary="Enable automatic system backups"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={systemConfig.autoBackup || false}
                            onChange={(e) => handleSystemChange('autoBackup', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemText
                          primary="Maintenance Mode"
                          secondary="Put system in maintenance mode"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={systemConfig.maintenanceMode || false}
                            onChange={(e) => handleSystemChange('maintenanceMode', e.target.checked)}
                            color="warning"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemText
                          primary="Debug Logging"
                          secondary="Enable detailed system logs"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={systemConfig.debugLogging || false}
                            onChange={(e) => handleSystemChange('debugLogging', e.target.checked)}
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
                          label="Maximum Projects"
                          type="number"
                          value={systemConfig.maxProjects || 100}
                          onChange={(e) => handleSystemChange('maxProjects', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Max Users per Project"
                          type="number"
                          value={systemConfig.maxUsersPerProject || 50}
                          onChange={(e) => handleSystemChange('maxUsersPerProject', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Session Timeout (minutes)"
                          type="number"
                          value={systemConfig.sessionTimeout || 30}
                          onChange={(e) => handleSystemChange('sessionTimeout', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value={systemConfig.backupFrequency || 'daily'}
                            onChange={(e) => handleSystemChange('backupFrequency', e.target.value)}
                            label="Backup Frequency"
                          >
                            <MenuItem value="hourly">Hourly</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
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

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">
                    Security Warning: Changes to these settings affect system-wide security.
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Enable 2FA for enhanced security"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.security?.twoFactorAuth || false}
                            onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Password Policy</InputLabel>
                          <Select
                            value={settings.security?.passwordPolicy || 'medium'}
                            onChange={(e) => handleSecurityChange('passwordPolicy', e.target.value)}
                            label="Password Policy"
                          >
                            <MenuItem value="low">Low (6+ characters)</MenuItem>
                            <MenuItem value="medium">Medium (8+ chars, mixed case)</MenuItem>
                            <MenuItem value="high">High (12+ chars, symbols)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Session Security</InputLabel>
                          <Select
                            value={settings.security?.sessionSecurity || 'high'}
                            onChange={(e) => handleSecurityChange('sessionSecurity', e.target.value)}
                            label="Session Security"
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="API Rate Limit (requests/hour)"
                          type="number"
                          value={settings.security?.apiRateLimit || 1000}
                          onChange={(e) => handleSecurityChange('apiRateLimit', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Max Login Attempts"
                          type="number"
                          value={settings.security?.loginAttempts || 5}
                          onChange={(e) => handleSecurityChange('loginAttempts', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Account Lock Time (minutes)"
                          type="number"
                          value={settings.security?.accountLockTime || 30}
                          onChange={(e) => handleSecurityChange('accountLockTime', parseInt(e.target.value))}
                        />
                      </Grid>
                    </Grid>
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
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.emailNotifications || false}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
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
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText
                      primary="System Alerts"
                      secondary="Critical system notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.systemAlerts !== false}
                        onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><SecurityIcon /></ListItemIcon>
                    <ListItemText
                      primary="Security Alerts"
                      secondary="Login attempts and security events"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.securityAlerts !== false}
                        onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><UpdateIcon /></ListItemIcon>
                    <ListItemText
                      primary="Project Updates"
                      secondary="Project progress and milestone notifications"
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
                      primary="User Activities"
                      secondary="User login and activity notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications?.userActivities || false}
                        onChange={(e) => handleNotificationChange('userActivities', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            )}

            {/* Data & Backup Tab */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Management & Backup
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <BackupIcon color="primary" />
                        <Typography variant="h6">System Backup</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Create a complete backup of system data including projects, users, and configurations.
                      </Typography>
                      <Button variant="contained" startIcon={<BackupIcon />}>
                        Create Backup
                      </Button>
                    </Card>

                    <Card sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <ExportIcon color="success" />
                        <Typography variant="h6">Export Data</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Export system data in various formats for analysis or migration.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" size="small">Export Projects</Button>
                        <Button variant="outlined" size="small">Export Users</Button>
                        <Button variant="outlined" size="small" onClick={exportSettings}>
                          Export Settings
                        </Button>
                      </Box>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <StorageIcon color="info" />
                        <Typography variant="h6">Data Retention</Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Data Retention Period (days)"
                        type="number"
                        value={systemConfig.dataRetentionDays || 365}
                        onChange={(e) => handleSystemChange('dataRetentionDays', parseInt(e.target.value))}
                        helperText="How long to keep deleted data in archive"
                        sx={{ mb: 2 }}
                      />
                    </Card>

                    <Card sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <WarningIcon color="error" />
                        <Typography variant="h6" color="error.main">Danger Zone</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Irreversible actions that affect the entire system.
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          color="warning"
                          onClick={() => setShowResetDialog(true)}
                          startIcon={<ResetIcon />}
                        >
                          Reset All Settings
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          disabled
                        >
                          Clear All Data
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
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

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset All Settings?</DialogTitle>
        <DialogContent>
          <Typography>
            This will reset all SuperAdmin settings to their default values. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={resetToDefaults} color="warning" variant="contained">
            Reset All Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuperAdminSettings;