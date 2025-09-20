// src/Pages/MaterialToolHub/components/MappingChallanForm.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon,
  Print as PrintIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const MappingChallanForm = ({ 
  open, 
  onClose, 
  hubItem, 
  mappedRequest, 
  onSubmitChallan 
}) => {
  const [challanData, setChallanData] = useState({
    // Pre-filled data from hub item and request
    challanNo: `CH-${Date.now()}`,
    materialName: hubItem?.itemName || '',
    quantity: mappedRequest?.quantity || '',
    unit: hubItem?.unit || '',
    supplierName: hubItem?.supplierName || '',
    areaInUse: hubItem?.areaInUse || '',
    
    // Admin needs to fill these
    vehicleNo: '',
    driverName: '',
    driverPhone: '',
    receiverName: mappedRequest?.requestedBy || '',
    receiverPhone: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    remarks: '',
    qualityCheck: true,
    adminNotes: '',
    
    // These will be filled by supervisor later
    deliveryPhoto: null, // Will be added by supervisor
    receivedDate: null,  // Will be added by supervisor
    receivedTime: null,  // Will be added by supervisor
    receiverSignature: null, // Will be added by supervisor
    deliveryStatus: 'Dispatched' // Initial status
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChallanData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const completeChallan = {
      ...challanData,
      hubItemId: hubItem.id,
      requestId: mappedRequest.id,
      mappedBy: 'Admin', // Replace with actual admin name
      mappedDate: new Date().toISOString(),
      fromProject: hubItem.projectName,
      fromSupervisor: hubItem.supervisorName,
      toProject: mappedRequest.projectName,
      toSupervisor: mappedRequest.requestedBy,
      status: 'Dispatched',
      challanType: 'Internal Transfer',
      requiresPhotoConfirmation: true, // Flag for supervisor
      requiresSignature: true // Flag for supervisor
    };

    onSubmitChallan(completeChallan);
    setSubmitStatus('Challan created successfully! Sent for delivery.');
    
    setTimeout(() => {
      setSubmitStatus('');
      onClose();
    }, 2000);
  };

  if (!hubItem || !mappedRequest) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Create Delivery Challan
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {submitStatus && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {submitStatus}
          </Alert>
        )}

        {/* Important Note for Admin */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> After creating this challan, the receiving supervisor will add delivery photo and confirmation when material/tool arrives at site.
          </Typography>
        </Alert>

        {/* Mapping Summary */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>Mapping Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>From:</strong> {hubItem.projectName}</Typography>
              <Typography variant="body2"><strong>Supervisor:</strong> {hubItem.supervisorName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>To:</strong> {mappedRequest.projectName}</Typography>
              <Typography variant="body2"><strong>Requested by:</strong> {mappedRequest.requestedBy}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Challan Number (Auto-generated) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Challan No (Auto-generated)"
                name="challanNo"
                value={challanData.challanNo}
                onChange={handleChange}
                required
                disabled
                variant="outlined"
              />
            </Grid>

            {/* Delivery Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dispatch Date"
                name="deliveryDate"
                type="date"
                value={challanData.deliveryDate}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Material Name (Pre-filled) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Material/Tool Name"
                name="materialName"
                value={challanData.materialName}
                onChange={handleChange}
                required
                disabled
                variant="outlined"
              />
            </Grid>

            {/* Quantity (Pre-filled from request) */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={challanData.quantity}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Unit (Pre-filled) */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={challanData.unit}
                onChange={handleChange}
                required
                disabled
                variant="outlined"
              />
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />
            
            {/* Admin Required Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Dispatch Details (Admin Required)
              </Typography>
            </Grid>

            {/* Vehicle Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle No"
                name="vehicleNo"
                value={challanData.vehicleNo}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter vehicle number"
              />
            </Grid>

            {/* Driver Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Name"
                name="driverName"
                value={challanData.driverName}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter driver name"
              />
            </Grid>

            {/* Driver Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Phone"
                name="driverPhone"
                value={challanData.driverPhone}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter driver phone number"
              />
            </Grid>

            {/* Receiver Name (Pre-filled but editable) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receiver Name (Site Supervisor)"
                name="receiverName"
                value={challanData.receiverName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Receiver Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receiver Phone"
                name="receiverPhone"
                value={challanData.receiverPhone}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Enter receiver phone number"
              />
            </Grid>

            {/* Dispatch Time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dispatch Time"
                name="deliveryTime"
                type="time"
                value={challanData.deliveryTime}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Area in Use (Pre-filled but editable) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area in Use"
                name="areaInUse"
                value={challanData.areaInUse}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Supplier Name (Pre-filled) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                name="supplierName"
                value={challanData.supplierName}
                onChange={handleChange}
                required
                disabled
                variant="outlined"
              />
            </Grid>

            {/* Quality Check */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={challanData.qualityCheck}
                      onChange={handleChange}
                      name="qualityCheck"
                      color="primary"
                    />
                  }
                  label="Quality Check Passed Before Dispatch"
                />
              </Box>
            </Grid>

            {/* Dispatch Remarks */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dispatch Remarks"
                name="remarks"
                value={challanData.remarks}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                placeholder="Any special dispatch instructions"
              />
            </Grid>

            {/* Admin Notes */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Notes"
                name="adminNotes"
                value={challanData.adminNotes}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                placeholder="Internal notes for tracking"
              />
            </Grid>

            {/* Supervisor Confirmation Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Pending Supervisor Confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  After dispatch, the receiving supervisor will:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li><Typography variant="body2">Take delivery photo upon arrival</Typography></li>
                  <li><Typography variant="body2">Confirm received quantity and condition</Typography></li>
                  <li><Typography variant="body2">Add digital signature</Typography></li>
                  <li><Typography variant="body2">Update delivery status to "Received"</Typography></li>
                </ul>
              </Paper>
            </Grid>

          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          size="large"
          startIcon={<PrintIcon />}
          sx={{ 
            minWidth: 150,
            fontWeight: 600
          }}
        >
          Dispatch Challan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MappingChallanForm;
