// src/Pages/AddEmployee/components/EmployeeForm/EmployeeForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid
} from '@mui/material';

const EmployeeForm = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'staff'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Employee Form Data:', formData);
    // TODO: API call to save employee
    alert('Employee data submitted!');
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4, lg: 5 },
          mx: { xs: 0, sm: 2, md: 4 }
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: { xs: 3, sm: 4, md: 5 },
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
            fontWeight: 600
          }}
        >
          Add Regular Employee
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            
            {/* Username Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Username
                </Typography>
                <TextField
                  fullWidth
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Email Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Employee ID Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Employee ID
                </Typography>
                <TextField
                  fullWidth
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Password Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Confirm Password Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                  }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: { xs: '48px', sm: '52px', md: '56px' },
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 },
                justifyContent: 'center',
                maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                mx: 'auto'
              }}>
                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    minHeight: { xs: '48px', sm: '52px', md: '56px' },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: '#1976d2',
                    flex: { xs: 'none', sm: 1 },
                    px: { xs: 3, sm: 4, md: 5 },
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    }
                  }}
                >
                  Submit
                </Button>

                {/* Cancel Button */}
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    minHeight: { xs: '48px', sm: '52px', md: '56px' },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    textTransform: 'none',
                    flex: { xs: 'none', sm: 1 },
                    px: { xs: 3, sm: 4, md: 5 },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeForm;
