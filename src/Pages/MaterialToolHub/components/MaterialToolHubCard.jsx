// src/Pages/MaterialToolHub/components/MaterialToolHubCard.jsx
import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Chip, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, 
  ListItemText, ListItemButton, Alert
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Close as CloseIcon,
  CheckCircle as CheckIcon 
} from '@mui/icons-material';
import MappingChallanForm from './MappingChallanForm';

// Sample available requests that can be mapped
const availableRequests = [
  {
    id: 'REQ-101',
    projectName: 'Project Alpha',
    requestedBy: 'John Doe',
    itemType: 'Material',
    itemName: 'Cement',
    quantity: 25,
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 'REQ-102', 
    projectName: 'Project Beta',
    requestedBy: 'Jane Smith',
    itemType: 'Tool',
    itemName: 'Drill Machine',
    quantity: 2,
    priority: 'Medium',
    status: 'Pending'
  },
  {
    id: 'REQ-103',
    projectName: 'Project Gamma', 
    requestedBy: 'Mike Wilson',
    itemType: 'Material',
    itemName: 'Steel Rods',
    quantity: 50,
    priority: 'Low',
    status: 'Pending'
  }
];

const MaterialToolHubCard = ({ item }) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [challanFormOpen, setChallanFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mappingStatus, setMappingStatus] = useState('');

  const handleView = () => {
    console.log('View item:', item);
    // TODO: Open item details modal
  };

  const handleMap = () => {
    setMapDialogOpen(true);
  };

  const handleMapToRequest = (request) => {
    // Check if item matches request
    const isCompatible = item.itemType === request.itemType && 
                        item.itemName.toLowerCase().includes(request.itemName.toLowerCase()) &&
                        item.quantity >= request.quantity;

    if (isCompatible) {
      setSelectedRequest(request);
      setMapDialogOpen(false);
      setChallanFormOpen(true); // Open challan form instead of showing success
    } else {
      setMappingStatus('Item is not compatible with this request');
      setTimeout(() => setMappingStatus(''), 3000);
    }
  };

  const handleChallanSubmit = (challanData) => {
    console.log('Challan created:', challanData);
    
    // Here you would typically:
    // 1. Save challan to database
    // 2. Update request status to "In Transit"
    // 3. Update hub item quantity
    // 4. Send notification to supervisor
    
    setChallanFormOpen(false);
    setSelectedRequest(null);
    setMappingStatus(`Challan ${challanData.challanNo} created successfully!`);
    setTimeout(() => setMappingStatus(''), 5000);
  };

  // Filter requests that are compatible with this hub item
  const compatibleRequests = availableRequests.filter(request => 
    request.itemType === item.itemType && 
    request.status === 'Pending' &&
    item.quantity >= request.quantity
  );

  return (
    <>
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {item.projectName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.7, fontSize: '0.875rem' }}>
              {item.requestId}
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body1" sx={{ mb: 0.5, fontSize: '0.9rem' }}>
              <strong>Supervisor:</strong> {item.supervisorName}
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body1" sx={{ mb: 0.5, fontSize: '0.9rem' }}>
              <strong>{item.itemType} Name:</strong> {item.itemName}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontSize: '0.9rem' }}>
              <strong>Quantity:</strong> {item.quantity} {item.unit}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={item.itemType}
              color={item.itemType === 'Material' ? 'primary' : 'secondary'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(item.uploadDate).toLocaleDateString()}
            </Typography>
          </Box>

          {mappingStatus && (
            <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {mappingStatus}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={handleView} color="primary">
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleMap}
              disabled={compatibleRequests.length === 0}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 2
              }}
            >
              Map to Request ({compatibleRequests.length})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Request Selection Dialog */}
      <Dialog 
        open={mapDialogOpen} 
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Select Request to Map</Typography>
          <IconButton onClick={() => setMapDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available: {item.quantity} {item.unit} of {item.itemName}
          </Typography>

          {compatibleRequests.length > 0 ? (
            <List>
              {compatibleRequests.map((request) => (
                <ListItem key={request.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleMapToRequest(request)}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {request.id} - {request.projectName}
                          </Typography>
                          <Chip 
                            label={request.priority} 
                            color={
                              request.priority === 'High' ? 'error' : 
                              request.priority === 'Medium' ? 'warning' : 'success'
                            }
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Requested by:</strong> {request.requestedBy}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Needs:</strong> {request.quantity} {item.unit} of {request.itemName}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            <CheckIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Compatible - Click to create challan
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No Compatible Requests Found
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMapDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Challan Form Dialog */}
      <MappingChallanForm
        open={challanFormOpen}
        onClose={() => {
          setChallanFormOpen(false);
          setSelectedRequest(null);
        }}
        hubItem={item}
        mappedRequest={selectedRequest}
        onSubmitChallan={handleChallanSubmit}
      />
    </>
  );
};

export default MaterialToolHubCard;
