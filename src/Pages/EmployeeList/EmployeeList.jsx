// src/pages/EmployeeList/EmployeeList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import hook


import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

// Default employee data
const defaultEmployees = [
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+91 9876543210',
    role: 'Site Engineer',
    department: 'Construction',
    status: 'Active',
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+91 9876543211',
    role: 'Project Manager',
    department: 'Management',
    status: 'Active',
    joinDate: '2023-11-20'
  },
  {
    id: 3,
    employeeId: 'SUP001',
    name: 'Robert Johnson',
    email: 'robert.johnson@company.com',
    phone: '+91 9876543212',
    role: 'Supervisor',
    department: 'Operations',
    status: 'Active',
    joinDate: '2023-08-10'
  },
  {
    id: 4,
    employeeId: 'EMP003',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+91 9876543213',
    role: 'Quality Inspector',
    department: 'Quality Control',
    status: 'Active',
    joinDate: '2024-02-28'
  },
  {
    id: 5,
    employeeId: 'EMP004',
    name: 'Michael Wilson',
    email: 'michael.wilson@company.com',
    phone: '+91 9876543214',
    role: 'Safety Officer',
    department: 'Safety',
    status: 'Inactive',
    joinDate: '2023-12-05'
  },
  {
    id: 6,
    employeeId: 'SUP002',
    name: 'Sarah Brown',
    email: 'sarah.brown@company.com',
    phone: '+91 9876543215',
    role: 'Supervisor',
    department: 'Materials',
    status: 'Active',
    joinDate: '2023-09-18'
  },
  {
    id: 7,
    employeeId: 'EMP005',
    name: 'David Martinez',
    email: 'david.martinez@company.com',
    phone: '+91 9876543216',
    role: 'Electrician',
    department: 'Electrical',
    status: 'Active',
    joinDate: '2024-03-12'
  },
  {
    id: 8,
    employeeId: 'EMP006',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+91 9876543217',
    role: 'Architect',
    department: 'Design',
    status: 'Active',
    joinDate: '2023-07-22'
  }
  
];


// Mobile Card Component for smaller screens
const EmployeeCard = ({ employee, onEdit, onDelete }) => 
    
    (
    
  <Card sx={{ mb: 2, boxShadow: 2 }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600 }}>
            {employee.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {employee.employeeId}
          </Typography>
        </Box>
        <Chip 
          label={employee.status}
          color={employee.status === 'Active' ? 'success' : 'default'}
          size="small"
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BadgeIcon sx={{ fontSize: '1rem', mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {employee.role} - {employee.department}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon sx={{ fontSize: '1rem', mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {employee.email}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PhoneIcon sx={{ fontSize: '1rem', mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {employee.phone}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(employee)}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(employee)}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Delete
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const EmployeeList = () => {
  const [employees, setEmployees] = useState(defaultEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    alert(`Edit employee: ${employee.name}`);
    handleMenuClose();
  };

  const handleDelete = (employee) => {
    console.log('Delete employee:', employee);
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployees(employees.filter(emp => emp.id !== employee.id));
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'default';
  };
    const navigate = useNavigate();


  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: { xs: 3, sm: 4 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
            fontWeight: 600,
            color: '#1976d2'
          }}
        >
          Employee List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/add')}  // Direct inline navigation

          sx={{
            minHeight: { xs: '40px', sm: '48px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 2, sm: 3 }
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search employees by name, ID, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              minHeight: { xs: '48px', sm: '56px' }
            }
          }}
        />
      </Paper>

      {/* Employee Count */}
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 2, 
          color: 'text.secondary',
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        Showing {filteredEmployees.length} of {employees.length} employees
      </Typography>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <Box>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      ) : (
        /* Desktop View - Table */
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="employee table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Join Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#f9f9f9' }
                  }}
                >
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {employee.employeeId}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {employee.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{employee.email}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{employee.phone}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{employee.role}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{employee.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.status}
                      color={getStatusColor(employee.status)}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{employee.joinDate}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(employee)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(employee)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* No results message */}
      {filteredEmployees.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria
          </Typography>
        </Paper>
      )}

      {/* Action Menu (for mobile if needed) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedEmployee)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedEmployee)}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default EmployeeList;
