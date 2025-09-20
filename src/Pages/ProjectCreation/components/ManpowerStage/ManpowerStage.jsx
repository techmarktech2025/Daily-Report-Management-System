// src/Pages/ProjectCreation/components/ManpowerStage/ManpowerStage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Sample supervisors data
const availableSupervisors = [
  { id: 1, name: 'Robert Johnson', employeeId: 'SUP001', department: 'Operations' },
  { id: 2, name: 'Sarah Brown', employeeId: 'SUP002', department: 'Materials' },
  { id: 3, name: 'Mike Wilson', employeeId: 'SUP003', department: 'Quality' },
  { id: 4, name: 'Alice Cooper', employeeId: 'SUP004', department: 'Safety' },
  { id: 5, name: 'James Miller', employeeId: 'SUP005', department: 'Construction' }
];

// Sample employees data
const availableEmployees = [
  { id: 1, name: 'John Doe', employeeId: 'EMP001', role: 'Site Engineer', department: 'Construction' },
  { id: 2, name: 'Jane Smith', employeeId: 'EMP002', role: 'Project Manager', department: 'Management' },
  { id: 3, name: 'Emily Davis', employeeId: 'EMP003', role: 'Quality Inspector', department: 'Quality Control' },
  { id: 4, name: 'David Martinez', employeeId: 'EMP005', role: 'Electrician', department: 'Electrical' },
  { id: 5, name: 'Lisa Anderson', employeeId: 'EMP006', role: 'Architect', department: 'Design' },
  { id: 6, name: 'Mark Thompson', employeeId: 'EMP007', role: 'Mason', department: 'Construction' },
  { id: 7, name: 'Sandra Lee', employeeId: 'EMP008', role: 'Plumber', department: 'Plumbing' },
  { id: 8, name: 'Tom Wilson', employeeId: 'EMP009', role: 'Welder', department: 'Welding' }
];

const ManpowerStage = ({ data, onComplete, onNext, onBack }) => {
  const [selectedSupervisors, setSelectedSupervisors] = useState(data?.supervisors || []);
  const [selectedEmployees, setSelectedEmployees] = useState(data?.employees || []);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const handleAddSupervisor = (supervisor) => {
    if (!selectedSupervisors.find(s => s.id === supervisor.id)) {
      setSelectedSupervisors(prev => [...prev, supervisor]);
    }
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(prev => prev.filter(s => s.id !== supervisorId));
  };

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const filteredEmployees = availableEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesFilter = !employeeFilter || employee.department === employeeFilter;
    return matchesSearch && matchesFilter;
  });

  const departments = [...new Set(availableEmployees.map(emp => emp.department))];

  const handleNext = () => {
    onComplete({ supervisors: selectedSupervisors, employees: selectedEmployees });
    onNext();
  };

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
        Stage 3: Add Manpower
      </Typography>

      <Grid container spacing={4}>
        
        {/* Supervisors Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Supervisors
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value=""
                displayEmpty
                onChange={(e) => {
                  const supervisor = availableSupervisors.find(s => s.id === e.target.value);
                  if (supervisor) handleAddSupervisor(supervisor);
                }}
                sx={{ minHeight: '56px' }}
              >
                <MenuItem value="" disabled>
                  Select Supervisor
                </MenuItem>
                {availableSupervisors
                  .filter(supervisor => !selectedSupervisors.find(s => s.id === supervisor.id))
                  .map((supervisor) => (
                    <MenuItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.employeeId}) - {supervisor.department}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Selected Supervisors ({selectedSupervisors.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '60px' }}>
              {selectedSupervisors.map((supervisor) => (
                <Chip
                  key={supervisor.id}
                  label={`${supervisor.name} (${supervisor.employeeId})`}
                  onDelete={() => handleRemoveSupervisor(supervisor.id)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
              {selectedSupervisors.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No supervisors selected yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Employees Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Filter Employees
            </Typography>
            
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search employees..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Department Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={employeeFilter}
                displayEmpty
                onChange={(e) => setEmployeeFilter(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Employee List */}
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Available Employees:
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.find(e => e.id === employee.id);
                return (
                  <ListItem
                    key={employee.id}
                    button
                    onClick={() => !isSelected && handleAddEmployee(employee)}
                    sx={{
                      opacity: isSelected ? 0.5 : 1,
                      cursor: isSelected ? 'not-allowed' : 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected ? 'transparent' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={employee.name}
                      secondary={`${employee.employeeId} - ${employee.role} (${employee.department})`}
                      primaryTypographyProps={{ fontWeight: isSelected ? 400 : 500 }}
                    />
                    {isSelected && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveEmployee(employee.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
              {filteredEmployees.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No employees found"
                    secondary="Try adjusting your search or filter"
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Selected Employees Summary */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>
              Selected Team ({selectedEmployees.length} employees)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '60px' }}>
              {selectedEmployees.map((employee) => (
                <Chip
                  key={employee.id}
                  label={`${employee.name} - ${employee.role}`}
                  onDelete={() => handleRemoveEmployee(employee.id)}
                  color="secondary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
              {selectedEmployees.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No employees selected yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2, 
        mt: 4 
      }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            minHeight: { xs: '48px', sm: '56px' },
            px: { xs: 3, sm: 4 },
            order: { xs: 2, sm: 1 }
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={selectedSupervisors.length === 0}
          sx={{
            minHeight: { xs: '48px', sm: '56px' },
            px: { xs: 3, sm: 4 },
            order: { xs: 1, sm: 2 }
          }}
        >
          Next: Tools at Site
        </Button>
      </Box>
    </Paper>
  );
};

export default ManpowerStage;
