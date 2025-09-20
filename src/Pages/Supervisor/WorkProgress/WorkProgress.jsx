// src/Pages/Supervisor/WorkProgress/WorkProgress.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Badge,
  IconButton,
  Divider,
  Fade
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Error as DelayedIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const WorkProgress = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    elevation: '',
    work: '',
    team: '',
    startDate: '',
    endDate: '',
    uploadedPicture: null,
    remark: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workItems, setWorkItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [delayRemark, setDelayRemark] = useState('');

  // Mock work items with different statuses
  const mockWorkItems = [
    {
      id: 1,
      elevation: 'Ground Floor - East Wing',
      work: 'Aluminium framing installation',
      team: 'Team A (5 workers)',
      startDate: '2025-08-25',
      endDate: '2025-08-27',
      status: 'Completed',
      remark: 'Work completed successfully',
      completedDate: '2025-08-27',
      createdAt: '2025-08-25T09:00:00'
    },
    {
      id: 2,
      elevation: 'First Floor - West Wing', 
      work: 'GI sheet installation',
      team: 'Team B (4 workers)',
      startDate: '2025-08-26',
      endDate: '2025-08-29', // Tomorrow - should trigger notification
      status: 'In Progress',
      remark: 'Work progressing well',
      createdAt: '2025-08-26T10:30:00'
    },
    {
      id: 3,
      elevation: 'Ground Floor - North Side',
      work: 'ACP sheet preparation',
      team: 'Team C (3 workers)', 
      startDate: '2025-08-28',
      endDate: '2025-08-29', // Yesterday - overdue
      status: 'Delayed',
      remark: 'Initial remark',
      delayRemark: 'Material delivery delayed by supplier',
      delayedSince: '2025-08-30',
      createdAt: '2025-08-28T14:00:00'
    }
  ];

  useEffect(() => {
    setWorkItems(mockWorkItems);
    checkForDueItems();
  }, []);

  // Check for items due today or overdue
  const checkForDueItems = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueNotifications = mockWorkItems
      .filter(item => 
        item.status === 'In Progress' && 
        item.endDate <= today
      )
      .map(item => ({
        id: `notification_${item.id}`,
        workId: item.id,
        type: 'completion_check',
        message: `Work "${item.work}" was scheduled to complete on ${item.endDate}. Is it completed?`,
        workItem: item
      }));

    setNotifications(dueNotifications);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitStatus('❌ Please upload only image files');
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setSubmitStatus('❌ File size must be less than 10MB');
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }

      setFormData(prev => ({
        ...prev,
        uploadedPicture: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['elevation', 'work', 'team', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setSubmitStatus(`❌ Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setSubmitStatus('❌ End date cannot be before start date');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('💾 Submitting work progress...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newWorkItem = {
        id: workItems.length + 1,
        elevation: formData.elevation,
        work: formData.work,
        team: formData.team,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'In Progress', // Always starts as In Progress
        remark: formData.remark || 'Work started',
        pictures: formData.uploadedPicture ? 1 : 0,
        createdAt: new Date().toISOString()
      };

      setWorkItems(prev => [newWorkItem, ...prev]);

      // Reset form
      setFormData({
        elevation: '',
        work: '',
        team: '',
        startDate: '',
        endDate: '',
        uploadedPicture: null,
        remark: ''
      });

      const fileInput = document.getElementById('picture-upload');
      if (fileInput) fileInput.value = '';

      setSubmitStatus('✅ Work progress submitted successfully! Status: In Progress');
      setTimeout(() => setSubmitStatus(''), 5000);

    } catch (error) {
      setSubmitStatus('❌ Failed to submit. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClick = (notification) => {
    setCurrentNotification(notification);
    setDelayRemark('');
    setShowNotificationDialog(true);
  };

  const handleWorkCompleted = () => {
    const workId = currentNotification.workId;
    setWorkItems(prev => prev.map(item => 
      item.id === workId 
        ? { ...item, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] }
        : item
    ));

    // Remove notification
    setNotifications(prev => prev.filter(n => n.workId !== workId));
    setShowNotificationDialog(false);
    setCurrentNotification(null);
  };

  const handleWorkDelayed = () => {
    if (!delayRemark.trim()) {
      alert('Please provide a reason for the delay');
      return;
    }

    const workId = currentNotification.workId;
    setWorkItems(prev => prev.map(item => 
      item.id === workId 
        ? { 
            ...item, 
            status: 'Delayed', 
            delayRemark: delayRemark,
            delayedSince: new Date().toISOString().split('T')[0]
          }
        : item
    ));

    // Remove notification
    setNotifications(prev => prev.filter(n => n.workId !== workId));
    setShowNotificationDialog(false);
    setCurrentNotification(null);
    setDelayRemark('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CompletedIcon sx={{ color: 'success.main' }} />;
      case 'In Progress': return <InProgressIcon sx={{ color: 'warning.main' }} />;
      case 'Delayed': return <DelayedIcon sx={{ color: 'error.main' }} />;
      default: return <InProgressIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';  
      case 'Delayed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Work in Progress
        </Typography>
        
        {/* Notifications Badge */}
        <Badge badgeContent={notifications.length} color="error">
          <IconButton 
            sx={{ 
              backgroundColor: notifications.length > 0 ? '#ffebee' : '#f5f5f5',
              '&:hover': { backgroundColor: notifications.length > 0 ? '#ffcdd2' : '#e0e0e0' }
            }}
          >
            <NotificationIcon color={notifications.length > 0 ? 'error' : 'disabled'} />
          </IconButton>
        </Badge>
      </Box>

      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={() => handleNotificationClick(notifications[0])}>
              REVIEW
            </Button>
          }
        >
          <strong>{notifications.length} work item(s)</strong> need your attention for completion status.
        </Alert>
      )}

      <Grid container spacing={4}>
        
        {/* Work Progress Form - Vertical Layout */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
              Submit Work Progress
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Elevation */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Elevation
                  </Typography>
                  <TextField
                    name="elevation"
                    value={formData.elevation}
                    onChange={handleInputChange}
                    placeholder="Enter elevation details"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        minHeight: '56px', 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Work Description */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Work
                  </Typography>
                  <TextField
                    name="work"
                    value={formData.work}
                    onChange={handleInputChange}
                    placeholder="Describe the work details and progress"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Team */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Team
                  </Typography>
                  <TextField
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="Enter team details"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        minHeight: '56px', 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Date Fields */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                      Start Date
                    </Typography>
                    <TextField
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          minHeight: '56px', 
                          backgroundColor: '#fafafa'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                      End Date
                    </Typography>
                    <TextField
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          minHeight: '56px', 
                          backgroundColor: '#fafafa'
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Upload Picture */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Upload Picture
                  </Typography>
                  <Card
                    sx={{
                      border: '2px dashed #ccc',
                      cursor: 'pointer',
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fafafa',
                      '&:hover': { borderColor: '#1976d2', backgroundColor: 'white' }
                    }}
                    onClick={() => document.getElementById('picture-upload').click()}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <input
                        id="picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <UploadIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formData.uploadedPicture 
                          ? `Selected: ${formData.uploadedPicture.name}`
                          : 'Click to upload work pictures'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Remark */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, color: '#2c3e50' }}>
                    Remark
                  </Typography>
                  <TextField
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    placeholder="Add any additional remarks"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#fafafa',
                        '&:hover': { backgroundColor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Status Message */}
                {submitStatus && (
                  <Alert 
                    severity={
                      submitStatus.includes('✅') ? 'success' : 
                      submitStatus.includes('💾') ? 'info' : 'error'
                    }
                  >
                    {submitStatus}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: '#2196f3',
                    minHeight: '56px'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>

              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Work Items List */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Work Items ({workItems.length})
            </Typography>
            
            <List>
              {workItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getStatusIcon(item.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.elevation}
                          </Typography>
                          <Chip 
                            label={item.status} 
                            color={getStatusColor(item.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Team: {item.team}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Due: {item.endDate}
                          </Typography>
                          {item.status === 'Delayed' && (
                            <Typography variant="caption" color="error.main">
                              Delayed since: {item.delayedSince}<br/>
                              Reason: {item.delayRemark}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < workItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

      </Grid>

      {/* Completion Confirmation Dialog */}
      <Dialog open={showNotificationDialog} onClose={() => setShowNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ color: 'warning.main', mr: 2 }} />
            Work Completion Check
          </Box>
          <IconButton onClick={() => setShowNotificationDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {currentNotification && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                {currentNotification.message}
              </Alert>
              
              <Typography variant="body1" gutterBottom>
                <strong>Work Details:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Elevation: {currentNotification.workItem.elevation}<br/>
                • Team: {currentNotification.workItem.team}<br/>
                • Scheduled End Date: {currentNotification.workItem.endDate}
              </Typography>

              <Typography variant="body1" gutterBottom>
                If work is not completed, please explain the delay:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter reason for delay (required if work is not completed)"
                value={delayRemark}
                onChange={(e) => setDelayRemark(e.target.value)}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleWorkDelayed}
            variant="outlined" 
            color="error"
            disabled={!delayRemark.trim()}
          >
            Mark as Delayed
          </Button>
          <Button 
            onClick={handleWorkCompleted}
            variant="contained" 
            color="success"
          >
            Mark as Completed
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkProgress;
