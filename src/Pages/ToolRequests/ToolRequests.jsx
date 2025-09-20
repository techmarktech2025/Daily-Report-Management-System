// src/Pages/ToolRequests/ToolRequests.jsx
import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import ToolRequestCard from './components/ToolRequestCard';

// Sample data (customize as needed)
const toolRequests = [
  {
    id: 'TREQ-001',
    projectName: 'Project Alpha',
    supervisorName: 'Vikas Kumar',
    toolName: 'Drill Machine',
    quantity: 4,
    priority: 'High'
  },
  {
    id: 'TREQ-002',
    projectName: 'Project Beta',
    supervisorName: 'Ayesha Singh',
    toolName: 'Hammer',
    quantity: 20,
    priority: 'Medium'
  },
  {
    id: 'TREQ-003',
    projectName: 'Project Delta',
    supervisorName: 'Daniel Gupta',
    toolName: 'Welding Machine',
    quantity: 2,
    priority: 'Low'
  },
  {
    id: 'TREQ-004',
    projectName: 'Project Omega',
    supervisorName: 'Sunil Rana',
    toolName: 'Measuring Tape',
    quantity: 15,
    priority: 'High'
  },
];

const ToolRequests = () => (
  <Container maxWidth="xl" sx={{ py: 5, background: '#eaecf2', minHeight: '100vh' }}>
    <Typography variant="h3" sx={{ mb: 5, fontWeight: 700 }}>
      Tools Request
    </Typography>
    <Grid container spacing={4}>
      {toolRequests.map((req) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={req.id}>
          <ToolRequestCard request={req} />
        </Grid>
      ))}
    </Grid>
  </Container>
);

export default ToolRequests;
