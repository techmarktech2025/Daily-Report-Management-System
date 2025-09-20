// src/Pages/Supervisor/Employees/Employees.jsx
import React, { useState } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Business as ContractorIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import EmployeesTable from './components/EmployeesTable';

const Employees = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    contractorName: '',
    employeeName: '',
    position: '',
    uploadedPhoto: null
  });
  
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      
      if (file.size > 5 * 1024 * 1024) {
        setSubmitStatus('❌ File size must be less than 5MB');
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }

      setFormData(prev => ({
        ...prev,
        uploadedPhoto: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['contractorName', 'employeeName', 'position'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setSubmitStatus(`❌ Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
    }

    if (!formData.uploadedPhoto) {
      setSubmitStatus('❌ Please upload employee photo');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('💾 Adding employee...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('contractorName', formData.contractorName);
      formDataToSend.append('employeeName', formData.employeeName);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('photo', formData.uploadedPhoto);
      formDataToSend.append('projectId', user?.assignedProjects?.[0]?.id);
      formDataToSend.append('supervisorId', user?.id);

      const response = await fetch('/api/employees', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        setFormData({
          contractorName: '',
          employeeName: '',
          position: '',
          uploadedPhoto: null
        });
        
        const fileInput = document.getElementById('photo-upload');
        if (fileInput) fileInput.value = '';

        setSubmitStatus('✅ Employee added successfully!');
        setTimeout(() => setSubmitStatus(''), 3000);
      } else {
        throw new Error('Failed to add employee');
      }

    } catch (error) {
      setSubmitStatus('❌ Failed to add employee. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 4 }}>
        Employee Management
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<PersonIcon />} iconPosition="start" label="Add Employee" />
          <Tab icon={<ContractorIcon />} iconPosition="start" label="View Employees" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            Add Contractor Employee
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Contractor Name
                </Typography>
                <TextField
                  name="contractorName"
                  value={formData.contractorName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px', backgroundColor: '#fafafa' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Upload Photo
                </Typography>
                <Card
                  sx={{
                    border: '2px dashed #ccc',
                    cursor: 'pointer',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { borderColor: '#1976d2' }
                  }}
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <UploadIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2">
                      {formData.uploadedPhoto ? formData.uploadedPhoto.name : 'Upload Photo'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Employee Name
                </Typography>
                <TextField
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px', backgroundColor: '#fafafa' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Position
                </Typography>
                <TextField
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px', backgroundColor: '#fafafa' } }}
                />
              </Grid>

              {submitStatus && (
                <Grid item xs={12}>
                  <Alert severity={submitStatus.includes('✅') ? 'success' : 'error'}>
                    {submitStatus}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 2, fontSize: '1.1rem', minHeight: '56px' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {activeTab === 1 && <EmployeesTable />}
    </Container>
  );
};

export default Employees;
