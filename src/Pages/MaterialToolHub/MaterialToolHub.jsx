// src/Pages/MaterialToolHub/MaterialToolHub.jsx
import React, { useState } from 'react';
import { Container, Typography, Grid, Box, Button, Paper, Tabs, Tab, Badge } from '@mui/material';
import MaterialToolHubCard from './components/MaterialToolHubCard';
import ChallanUploadForm from './components/ChallanUploadForm';
// Removed the RequestMappingPanel import

// Sample data for available materials/tools in hub
const initialHubItems = [
  {
    id: 'HUB-001',
    projectName: 'Project Alpha',
    requestId: 'REQ-001',
    supervisorName: 'Rajesh Kumar',
    itemType: 'Material',
    itemName: 'Cement',
    quantity: 50,
    unit: 'Bags',
    uploadDate: '2025-08-25'
  },
  {
    id: 'HUB-002',
    projectName: 'Project Beta',
    requestId: 'REQ-002', 
    supervisorName: 'Priya Singh',
    itemType: 'Tool',
    itemName: 'Drill Machine',
    quantity: 3,
    unit: 'Units',
    uploadDate: '2025-08-26'
  },
  {
    id: 'HUB-003',
    projectName: 'Project Gamma',
    requestId: 'REQ-003',
    supervisorName: 'Amit Sharma',
    itemType: 'Material',
    itemName: 'Steel Rods',
    quantity: 100,
    unit: 'Pieces',
    uploadDate: '2025-08-24'
  }
];

const MaterialToolHub = () => {
  const [hubItems, setHubItems] = useState(initialHubItems);
  const [activeTab, setActiveTab] = useState(0);
  const [pendingMappings, setPendingMappings] = useState(3); // Example count

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: `HUB-${String(hubItems.length + 1).padStart(3, '0')}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setHubItems([itemWithId, ...hubItems]);
    setActiveTab(0); // Switch back to hub view
  };

  const filteredItems = activeTab === 1 ? hubItems.filter(item => item.itemType === 'Material') 
                     : activeTab === 2 ? hubItems.filter(item => item.itemType === 'Tool')
                     : hubItems;

  return (
    <Container maxWidth="xl" sx={{ py: 4, background: '#eaecf2', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: '#1976d2' }}>
        Material & Tool Hub
      </Typography>

      {/* Tabs without the pending mappings for now */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Items" />
          <Tab label="Materials Only" />
          <Tab label="Tools Only" />
          <Tab label="Upload New Item" />
        </Tabs>
      </Paper>

      {/* Upload Form Tab */}
      {activeTab === 3 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Upload Material/Tool Challan
          </Typography>
          <ChallanUploadForm onSubmit={handleAddItem} />
        </Paper>
      )}

      {/* Hub Items Display */}
      {activeTab < 3 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Available Items ({filteredItems.length})
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setActiveTab(3)}
              sx={{ fontWeight: 500 }}
            >
              Upload New Item
            </Button>
          </Box>
          
          <Grid container spacing={4}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <MaterialToolHubCard item={item} />
              </Grid>
            ))}
          </Grid>

          {filteredItems.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload new items to see them here
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default MaterialToolHub;
