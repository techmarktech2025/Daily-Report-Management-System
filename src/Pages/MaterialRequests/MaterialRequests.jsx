// src/Pages/MaterialRequests/MaterialRequests.jsx
import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import MaterialRequestCard from './components/MaterialRequestCard';

// Sample data (replace with your actual data)
const requests = [
  {
    id: 'REQ-001',
    projectName: 'Project Apollo',
    supervisorName: 'John Doe',
    materialName: 'Cement',
    quantity: 100,
    priority: 'High',
  },
  {
    id: 'REQ-002',
    projectName: 'Project Beta',
    supervisorName: 'Jane Smith',
    materialName: 'Steel Rods',
    quantity: 250,
    priority: 'Medium',
  },
  {
    id: 'REQ-003',
    projectName: 'Project Gamma',
    supervisorName: 'Amit Patel',
    materialName: 'Bricks',
    quantity: 5000,
    priority: 'Low',
  },
  {
    id: 'REQ-004',
    projectName: 'Project Delta',
    supervisorName: 'Linda Lee',
    materialName: 'Sand',
    quantity: 200,
    priority: 'High',
  },
];

const MaterialRequests = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 5, background: '#eaecf2', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ mb: 5, fontWeight: 700 }}>
        Material Request
      </Typography>
      <Grid container spacing={4}>
        {requests.map((req) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={req.id}>
            <MaterialRequestCard request={req} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MaterialRequests;
