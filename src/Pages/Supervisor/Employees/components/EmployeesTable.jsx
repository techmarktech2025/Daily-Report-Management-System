// src/Pages/Supervisor/Employees/components/EmployeesTable.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Avatar,
  Typography,
  Box,
  TablePagination,
  MenuItem
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const EmployeesTable = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filters, setFilters] = useState({
    contractorName: '',
    employeeName: '',
    position: '',
    dateFrom: '',
    dateTo: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const applyFilters = () => {
    let filtered = employees.filter(employee => {
      return (
        (!filters.contractorName || employee.contractorName.toLowerCase().includes(filters.contractorName.toLowerCase())) &&
        (!filters.employeeName || employee.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())) &&
        (!filters.position || employee.position.toLowerCase().includes(filters.position.toLowerCase())) &&
        (!filters.dateFrom || new Date(employee.createdAt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(employee.createdAt) <= new Date(filters.dateTo))
      );
    });
    setFilteredEmployees(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        All Employees ({filteredEmployees.length})
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            name="contractorName"
            label="Contractor"
            value={filters.contractorName}
            onChange={handleFilterChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            name="employeeName"
            label="Employee"
            value={filters.employeeName}
            onChange={handleFilterChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            name="position"
            label="Position"
            value={filters.position}
            onChange={handleFilterChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            name="dateFrom"
            label="From Date"
            type="date"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            name="dateTo"
            label="To Date"
            type="date"
            value={filters.dateTo}
            onChange={handleFilterChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Contractor Name</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Added Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Avatar src={employee.photoUrl} sx={{ width: 40, height: 40 }}>
                      <PersonIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>{employee.contractorName}</TableCell>
                  <TableCell>{employee.employeeName}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredEmployees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default EmployeesTable;
