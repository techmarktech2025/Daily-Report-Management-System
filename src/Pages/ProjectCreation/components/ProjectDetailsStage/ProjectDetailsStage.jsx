// src/Pages/ProjectCreation/components/ProjectDetailsStage/ProjectDetailsStage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid
} from '@mui/material';

const ProjectDetailsStage = ({ data, onComplete, onNext }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    jobNo: '',
    orderNo: '',
    dateOfCompletion: '',
    ...data
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...data }));
  }, [data]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
    onNext();
  };

  const isFormValid = formData.projectName && formData.jobNo && formData.orderNo && formData.dateOfCompletion;

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: { xs: 3, sm: 4 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 600
        }}
      >
        Stage 1: Project Details
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          
          {/* Project Name */}
          <Grid item xs={12}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Project Name
              </Typography>
              <TextField
                fullWidth
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Job No */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Job No
              </Typography>
              <TextField
                fullWidth
                name="jobNo"
                value={formData.jobNo}
                onChange={handleChange}
                placeholder="Enter job number"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Order No */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Order No
              </Typography>
              <TextField
                fullWidth
                name="orderNo"
                value={formData.orderNo}
                onChange={handleChange}
                placeholder="Enter order number"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Date of Completion */}
          <Grid item xs={12}>
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Date of Completion
              </Typography>
              <TextField
                fullWidth
                name="dateOfCompletion"
                type="date"
                value={formData.dateOfCompletion}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isFormValid}
                sx={{
                  minHeight: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  px: { xs: 3, sm: 4, md: 5 }
                }}
              >
                Next: Scope of Work
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectDetailsStage;
