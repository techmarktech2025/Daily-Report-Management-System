// src/Pages/AddEmployee/AddEmployee.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// Import components
import EmployeeForm from './Components/EmployeeForm/EmployeeForm';
import SupervisorForm from './Components/SupervisorForm/SupervisorForm';

const AddEmployee = () => {
  const [activeForm, setActiveForm] = useState(null);

  const handleEmployeeClick = () => {
    setActiveForm('employee');
  };

  const handleSupervisorClick = () => {
    setActiveForm('supervisor');
  };

  const handleBackToSelection = () => {
    setActiveForm(null);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh'
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
          fontWeight: 600,
          mb: { xs: 3, sm: 4, md: 5 },
          color: '#1976d2'
        }}
      >
        Add Employee
      </Typography>
      
      {/* Button Selection View */}
      {!activeForm && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4, lg: 5 },
            mt: { xs: 2, sm: 3, md: 4 },
            mx: { xs: 0, sm: 2, md: 4 }
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: { xs: 3, sm: 4, md: 5 },
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              fontWeight: 500,
              color: '#333'
            }}
          >
            Choose Employee Type
          </Typography>
          
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            <Grid item xs={12} sm={6} md={5} lg={4}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PersonAddIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />}
                onClick={handleEmployeeClick}
                sx={{
                  minHeight: { xs: '80px', sm: '100px', md: '120px' },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  px: { xs: 2, sm: 3, md: 4 }
                }}
              >
                Add Regular Employee
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={5} lg={4}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SupervisorAccountIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />}
                onClick={handleSupervisorClick}
                color="secondary"
                sx={{
                  minHeight: { xs: '80px', sm: '100px', md: '120px' },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  px: { xs: 2, sm: 3, md: 4 }
                }}
              >
                Add Supervisor
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Employee Form View */}
      {activeForm === 'employee' && (
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBackToSelection}
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            ← Back to Selection
          </Button>
          <EmployeeForm onCancel={handleBackToSelection} />
        </Box>
      )}

      {/* Supervisor Form View */}
      {activeForm === 'supervisor' && (
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBackToSelection}
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            ← Back to Selection
          </Button>
          <SupervisorForm onCancel={handleBackToSelection} />
        </Box>
      )}
    </Container>
  );
};

export default AddEmployee;
