// src/Pages/Supervisor/SupervisorConfirmation/SupervisorConfirmation.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Assignment as ScopeIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  Warning as WarningIcon,
  CheckCircle as ConfirmIcon,
  Person as SupervisorIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useProject } from '../../../contexts/ProjectContext';

const SupervisorConfirmation = ({ onConfirmationComplete }) => {
  const { user } = useAuth();
  const { getProjectBySupervisor, setSupervisorConfirmation, needsConfirmation } = useProject();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [confirmationData, setConfirmationData] = useState({
    scopeConfirmed: false,
    materialsConfirmed: false,
    toolsConfirmed: false,
    remarks: '',
    confirmationChecks: {
      scopeReviewed: false,
      materialsVerified: false,
      toolsVerified: false,
      responsibilityAccepted: false
    }
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const confirmationSteps = [
    { title: 'Scope of Work Review', icon: ScopeIcon },
    { title: 'Materials Verification', icon: MaterialIcon },
    { title: 'Tools Verification', icon: ToolIcon }
  ];

  useEffect(() => {
    loadProjectData();
  }, [user]);

  const loadProjectData = async () => {
    if (user && user.employeeId) {
      const userProject = getProjectBySupervisor(user.employeeId);
      
      if (userProject) {
        setProject(userProject);
        
        // Check if supervisor needs confirmation
        const needsConf = needsConfirmation(userProject.id, user.employeeId);
        if (!needsConf) {
          onConfirmationComplete && onConfirmationComplete();
        }
      }
    }
    setLoading(false);
  };

  const handleStepNext = () => {
    if (activeStep < confirmationSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleStepBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleCheckboxChange = (checkName) => {
    setConfirmationData(prev => ({
      ...prev,
      confirmationChecks: {
        ...prev.confirmationChecks,
        [checkName]: !prev.confirmationChecks[checkName]
      }
    }));
  };

  const handleRemarksChange = (e) => {
    setConfirmationData(prev => ({
      ...prev,
      remarks: e.target.value
    }));
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0: // Scope Review
        return confirmationData.confirmationChecks.scopeReviewed;
      case 1: // Materials
        return confirmationData.confirmationChecks.materialsVerified;
      case 2: // Tools
        return confirmationData.confirmationChecks.toolsVerified;
      default:
        return false;
    }
  };

  const canCompleteConfirmation = () => {
    return Object.values(confirmationData.confirmationChecks).every(check => check === true);
  };

  const handleFinalConfirmation = async () => {
    if (!canCompleteConfirmation()) {
      alert('Please complete all confirmation steps');
      return;
    }

    const finalConfirmationData = {
      ...confirmationData,
      scopeConfirmed: true,
      materialsConfirmed: true,
      toolsConfirmed: true,
      projectSnapshot: {
        scopeOfWork: project.scopeOfWork,
        materials: project.materials,
        tools: project.tools,
        confirmedAt: new Date().toISOString()
      }
    };

    setSupervisorConfirmation(project.id, user.employeeId, finalConfirmationData);
    setShowConfirmDialog(false);
    onConfirmationComplete && onConfirmationComplete();
  };

  const renderScopeReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <ScopeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Project Scope of Work Review
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Please review all scope items carefully. This will be your work assignment for the project.
      </Alert>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Scope of Work</strong></TableCell>
              <TableCell><strong>East</strong></TableCell>
              <TableCell><strong>West</strong></TableCell>
              <TableCell><strong>North</strong></TableCell>
              <TableCell><strong>South</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Unit</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project?.scopeOfWork?.map((scope, index) => (
              <TableRow key={index}>
                <TableCell>{scope.scopeOfWork}</TableCell>
                <TableCell>{scope.east || '-'}</TableCell>
                <TableCell>{scope.west || '-'}</TableCell>
                <TableCell>{scope.north || '-'}</TableCell>
                <TableCell>{scope.south || '-'}</TableCell>
                <TableCell><strong>{scope.total}</strong></TableCell>
                <TableCell>{scope.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Card>
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox 
                checked={confirmationData.confirmationChecks.scopeReviewed}
                onChange={() => handleCheckboxChange('scopeReviewed')}
                color="primary"
              />
            }
            label="I have reviewed and understood all scope of work items listed above"
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderMaterialsVerification = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <MaterialIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Project Materials Verification
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        These materials are available for your project requests. Verify the list is complete.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {project?.materials?.map((material, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2">
                  <MaterialIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  {material.materialName}
                </Typography>
                {material.unit && (
                  <Typography variant="caption" color="text.secondary">
                    Unit: {material.unit}
                  </Typography>
                )}
                {material.description && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {material.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {project?.materials?.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No materials have been added to this project yet.
        </Alert>
      )}

      <Card>
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox 
                checked={confirmationData.confirmationChecks.materialsVerified}
                onChange={() => handleCheckboxChange('materialsVerified')}
                color="primary"
              />
            }
            label={`I have verified the materials list (${project?.materials?.length || 0} items) and understand these will be available for my requests`}
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderToolsVerification = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <ToolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Project Tools Verification
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        These tools are available for your project requests. Verify the list is complete.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {project?.tools?.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2">
                  <ToolIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  {tool.materialName}
                </Typography>
                {tool.quantity && (
                  <Typography variant="caption" color="text.secondary">
                    Quantity: {tool.quantity}
                  </Typography>
                )}
                {tool.description && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {tool.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {project?.tools?.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No tools have been added to this project yet.
        </Alert>
      )}

      <Card>
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox 
                checked={confirmationData.confirmationChecks.toolsVerified}
                onChange={() => handleCheckboxChange('toolsVerified')}
                color="primary"
              />
            }
            label={`I have verified the tools list (${project?.tools?.length || 0} items) and understand these will be available for my requests`}
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={confirmationData.confirmationChecks.responsibilityAccepted}
                  onChange={() => handleCheckboxChange('responsibilityAccepted')}
                  color="primary"
                />
              }
              label="I accept responsibility as an authorized supervisor for this project"
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Additional Remarks (Optional)"
          placeholder="Add any comments or concerns about the project scope, materials, or tools..."
          value={confirmationData.remarks}
          onChange={handleRemarksChange}
          variant="outlined"
        />
      </Box>
    </Box>
  );

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return renderScopeReview();
      case 1:
        return renderMaterialsVerification();
      case 2:
        return renderToolsVerification();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading project data...</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No project found for your supervisor ID. Please contact admin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <WarningIcon color="warning" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Supervisor Authorization Required
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              You have been added to project: <strong>{project.projectName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please review and confirm the project details before you can access supervisor functions.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Steps */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Step {activeStep + 1} of {confirmationSteps.length}: {confirmationSteps[activeStep].title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {confirmationSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Chip
                key={index}
                icon={<StepIcon />}
                label={step.title}
                color={index <= activeStep ? "primary" : "default"}
                variant={index === activeStep ? "filled" : "outlined"}
              />
            );
          })}
        </Box>

        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            onClick={handleStepBack} 
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          
          <Button 
            onClick={handleStepNext}
            disabled={!canProceedToNext()}
            variant="contained"
          >
            {activeStep === confirmationSteps.length - 1 ? 'Complete Confirmation' : 'Next'}
          </Button>
        </Box>
      </Paper>

      {/* Final Confirmation Dialog */}
      <Dialog open={showConfirmDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <ConfirmIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Final Confirmation Required
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            By confirming, you accept responsibility as an authorized supervisor for this project.
          </Alert>
          
          <Typography variant="h6" gutterBottom>Confirmation Summary:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><ScopeIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Scope of Work Reviewed" 
                secondary={`${project?.scopeOfWork?.length || 0} scope items`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MaterialIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Materials Verified" 
                secondary={`${project?.materials?.length || 0} material types available`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ToolIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Tools Verified" 
                secondary={`${project?.tools?.length || 0} tool types available`}
              />
            </ListItem>
          </List>

          {confirmationData.remarks && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Your Remarks:</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">{confirmationData.remarks}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleFinalConfirmation} 
            variant="contained" 
            disabled={!canCompleteConfirmation()}
          >
            Confirm & Start Working
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupervisorConfirmation;