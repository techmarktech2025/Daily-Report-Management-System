// src/Pages/SuperAdmin/Inventory/InventoryOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Badge,
  Tab,
  Tabs
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Build as ToolIcon,
  LocalShipping as RequestIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { useProject } from '../../../contexts/ProjectContext';

const InventoryOverview = () => {
  const { projects } = useProject();
  const [activeTab, setActiveTab] = useState(0);
  const [inventoryData, setInventoryData] = useState({});

  useEffect(() => {
    calculateInventoryData();
  }, [projects]);

  const calculateInventoryData = () => {
    const materialInventory = {};
    const toolInventory = {};
    let totalRequests = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;

    projects.forEach(project => {
      // Process materials
      project.materials?.forEach(material => {
        const key = material.materialName;
        if (!materialInventory[key]) {
          materialInventory[key] = {
            name: key,
            projects: [],
            totalAvailable: 0,
            totalRequested: 0,
            pendingRequests: 0,
            approvedRequests: 0
          };
        }
        materialInventory[key].projects.push(project.projectDetails?.projectName || project.projectName);
        materialInventory[key].totalAvailable += 1;
      });

      // Process tools
      project.tools?.forEach(tool => {
        const key = tool.materialName;
        if (!toolInventory[key]) {
          toolInventory[key] = {
            name: key,
            projects: [],
            totalAvailable: 0,
            totalRequested: 0,
            pendingRequests: 0,
            approvedRequests: 0
          };
        }
        toolInventory[key].projects.push(project.projectDetails?.projectName || project.projectName);
        toolInventory[key].totalAvailable += 1;
      });

      // Process requests
      const projectRequests = localStorage.getItem(`requests_${project.id}`);
      if (projectRequests) {
        const requests = JSON.parse(projectRequests);
        totalRequests += requests.length;
        
        requests.forEach(request => {
          const key = request.materialName;
          const inventory = request.type === 'Material' ? materialInventory : toolInventory;
          
          if (inventory[key]) {
            inventory[key].totalRequested += request.quantity || 1;
            
            if (request.status === 'Pending') {
              inventory[key].pendingRequests += 1;
              pendingRequests += 1;
            } else if (request.status === 'Approved') {
              inventory[key].approvedRequests += 1;
              approvedRequests += 1;
            } else if (request.status === 'Rejected') {
              rejectedRequests += 1;
            }
          }
        });
      }
    });

    setInventoryData({
      materials: Object.values(materialInventory),
      tools: Object.values(toolInventory),
      totalMaterials: Object.keys(materialInventory).length,
      totalTools: Object.keys(toolInventory).length,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const currentInventory = activeTab === 0 ? inventoryData.materials || [] : inventoryData.tools || [];
  const currentType = activeTab === 0 ? 'Material' : 'Tool';

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Material & Tool Inventory Overview
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              System-wide inventory management and request tracking
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {inventoryData.totalMaterials || 0}
            </Typography>
            <Typography variant="body2">Total Material Types</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {inventoryData.totalTools || 0}
            </Typography>
            <Typography variant="body2">Total Tool Types</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {inventoryData.totalRequests || 0}
            </Typography>
            <Typography variant="body2">Total Requests</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight={700}>
              {Math.round(inventoryData.approvalRate || 0)}%
            </Typography>
            <Typography variant="body2">Approval Rate</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Request Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main" fontWeight={600}>
              {inventoryData.pendingRequests || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Requests
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h4" color="success.main" fontWeight={600}>
              {inventoryData.approvedRequests || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved Requests
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="h4" color="error.main" fontWeight={600}>
              {inventoryData.rejectedRequests || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejected Requests
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" color="text.secondary" fontWeight={600}>
              {projects.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={inventoryData.totalMaterials || 0} color="primary">
                Materials
              </Badge>
            } 
            icon={<InventoryIcon />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={inventoryData.totalTools || 0} color="secondary">
                Tools
              </Badge>
            } 
            icon={<ToolIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{currentType} Name</strong></TableCell>
              <TableCell align="center"><strong>Available in Projects</strong></TableCell>
              <TableCell align="center"><strong>Total Requested</strong></TableCell>
              <TableCell align="center"><strong>Pending Requests</strong></TableCell>
              <TableCell align="center"><strong>Approved Requests</strong></TableCell>
              <TableCell align="center"><strong>Utilization</strong></TableCell>
              <TableCell><strong>Projects Using</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInventory.map((item, index) => {
              const utilizationRate = item.totalAvailable > 0 ? (item.totalRequested / item.totalAvailable) * 100 : 0;
              
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.totalAvailable} 
                      color="info" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {item.totalRequested}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={item.pendingRequests} color="warning">
                      <PendingIcon color="warning" />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={item.approvedRequests} color="success">
                      <ApprovedIcon color="success" />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(utilizationRate, 100)} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: '#f5f5f5'
                        }}
                        color={utilizationRate > 80 ? 'error' : utilizationRate > 50 ? 'warning' : 'success'}
                      />
                      <Typography variant="caption">
                        {Math.round(utilizationRate)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {item.projects.slice(0, 3).map((project, idx) => (
                        <Chip 
                          key={idx}
                          label={project.length > 15 ? project.substring(0, 15) + '...' : project}
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {item.projects.length > 3 && (
                        <Chip 
                          label={`+${item.projects.length - 3} more`}
                          size="small" 
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {currentInventory.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {currentType} Inventory Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentType}s will appear here once projects with {currentType.toLowerCase()} lists are created.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default InventoryOverview;