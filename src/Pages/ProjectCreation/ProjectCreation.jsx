// src/Pages/ProjectCreation/ProjectCreationEnhanced.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Info as InfoIcon,
  Assignment as ScopeIcon,
  Inventory as MaterialIcon,
  People as ManpowerIcon
} from '@mui/icons-material';

// Import Enhanced Stage Components
import ProjectDetailsStage from './components/ProjectDetailsStage/ProjectDetailsStage';
import ScopeOfWorkStage from './components/ScopeOfWorkStage/ScopeOfWorkStage';
import ToolsStage from './components/ToolsStage/ToolsStage';
import ManpowerStage from './components/ManpowerStage/ManpowerStage';

const steps = [
  { label: 'Project Details', icon: InfoIcon, description: 'Basic project information' },
  { label: 'Scope of Work', icon: ScopeIcon, description: 'Upload and manage work scope' },
  { label: 'Material & Tool List', icon: MaterialIcon, description: 'Define project materials and tools' },
  { label: 'Add Manpower', icon: ManpowerIcon, description: 'Assign supervisors and employees' }
];

const ProjectCreation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    projectDetails: {},
    scopeOfWork: [],
    materialToolList: { materials: [], tools: [] },
    manpower: { supervisors: [], employees: [] }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('projectDraft', JSON.stringify(projectData));
    setSnackbar({ open: true, message: 'Draft saved successfully!', severity: 'success' });
  };

  const handleStageComplete = (stageData) => {
    const stageKeys = ['projectDetails', 'scopeOfWork', 'materialToolList', 'manpower'];
    setProjectData(prev => ({ ...prev, [stageKeys[activeStep]]: stageData }));
  };

  const handleProjectComplete = () => {
    // Here you would typically save to your backend/database
    console.log('Project completed:', projectData);
    
    // Create project ID
    const projectId = `PROJ-${Date.now()}`;
    
    // Add metadata
    const finalProjectData = {
      ...projectData,
      id: projectId,
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: 'admin', // Get from auth context
      progress: 0
    };

    // Save to localStorage (replace with API call)
    const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    existingProjects.push(finalProjectData);
    localStorage.setItem('projects', JSON.stringify(existingProjects));

    // Clear draft
    localStorage.removeItem('projectDraft');

    setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
    
    // Redirect after success
    setTimeout(() => {
      window.location.href = '/admin/projects/list';
    }, 2000);
  };

  const isStepCompleted = (step) => {
    const stageKeys = ['projectDetails', 'scopeOfWork', 'materialToolList', 'manpower'];
    const stageData = projectData[stageKeys[step]];
    
    switch (step) {
      case 0: return stageData?.projectName && stageData?.jobNo;
      case 1: return Array.isArray(stageData) && stageData.length > 0;
      case 2: return (stageData?.materials?.length > 0) || (stageData?.tools?.length > 0);
      case 3: return stageData?.supervisors?.length > 0;
      default: return false;
    }
  };

  const getCurrentStageComponent = () => {
    switch (activeStep) {
      case 0: 
        return (
          <ProjectDetailsStage
            data={projectData.projectDetails}
            onComplete={handleStageComplete}
            onNext={handleNext}
          />
        );
      case 1: 
        return (
          <ScopeOfWorkStage
            data={projectData.scopeOfWork}
            onComplete={handleStageComplete}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2: 
        return (
          <ToolsStage
            data={projectData.materialToolList}
            onComplete={handleStageComplete}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3: 
        return (
          <ManpowerStage
            data={projectData.manpower}
            onComplete={handleStageComplete}
            onProjectComplete={handleProjectComplete}
            onBack={handleBack}
          />
        );
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, 
              fontWeight: 600, 
              color: '#1976d2', 
              mb: 2 
            }}
          >
            Create New Project
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <strong>Enhanced Features:</strong> This project creation system now supports Excel upload for scope of work and materials/tools with virtual table review before approval.
          </Alert>

          {/* Save Draft Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={handleSaveDraft}
              sx={{ textTransform: 'none' }}
            >
              Save Draft
            </Button>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 4 }}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        backgroundColor: 
                          index === activeStep ? 'primary.main' : 
                          isStepCompleted(index) ? 'success.main' : 'grey.300'
                      }}
                    >
                      <StepIcon />
                    </Box>
                  )}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Stage Content */}
        {getCurrentStageComponent()}

        {/* Success Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ProjectCreation;