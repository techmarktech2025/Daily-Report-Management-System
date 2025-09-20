// src/Pages/MaterialToolHub/components/ChallanUploadForm.jsx
import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const ChallanUploadForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    supervisorName: '',
    itemType: 'Material',
    materialName: '',
    challanNo: '',
    quantity: '',
    unit: '',
    supplierName: '',
    areaInUse: '',
    vehicleNo: '',
    remarks: '',
    isRightQuality: true,
    photo: null
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the item object to match hub structure
    const newItem = {
      projectName: formData.projectName,
      requestId: `REQ-${Date.now()}`,
      supervisorName: formData.supervisorName,
      itemType: formData.itemType,
      itemName: formData.materialName,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      challanNo: formData.challanNo,
      supplierName: formData.supplierName,
      areaInUse: formData.areaInUse,
      vehicleNo: formData.vehicleNo,
      remarks: formData.remarks,
      qualityCheck: formData.isRightQuality ? 'Right' : 'Wrong',
      photo: formData.photo
    };

    onSubmit(newItem);
    
    // Reset form
    setFormData({
      projectName: '',
      supervisorName: '',
      itemType: 'Material',
      materialName: '',
      challanNo: '',
      quantity: '',
      unit: '',
      supplierName: '',
      areaInUse: '',
      vehicleNo: '',
      remarks: '',
      isRightQuality: true,
      photo: null
    });

    setSubmitStatus('Item uploaded successfully!');
    setTimeout(() => setSubmitStatus(''), 3000);
  };

  return (
    <Paper elevation={2} sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          
          {/* Project Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Supervisor Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supervisor Name"
              name="supervisorName"
              value={formData.supervisorName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Item Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Item Type</InputLabel>
              <Select
                name="itemType"
                value={formData.itemType}
                label="Item Type"
                onChange={handleChange}
                sx={{ minHeight: '56px' }}
              >
                <MenuItem value="Material">Material</MenuItem>
                <MenuItem value="Tool">Tool</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Material/Tool Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`${formData.itemType} Name`}
              name="materialName"
              value={formData.materialName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Challan No */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Challan No (AI)"
              name="challanNo"
              value={formData.challanNo}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Unit */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Supplier Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Area in Use */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Area in Use"
              name="areaInUse"
              value={formData.areaInUse}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Vehicle No */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vehicle No"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
            />
          </Grid>

          {/* Quality Checkbox & Remarks */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isRightQuality}
                    onChange={handleChange}
                    name="isRightQuality"
                    color="primary"
                  />
                }
                label="Quality Check (Right or Wrong)"
              />
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Upload Photo */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Upload Photo:
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
                sx={{
                  backgroundColor: '#000',
                  color: 'white',
                  '&:hover': { backgroundColor: '#333' }
                }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {formData.photo && (
                <Typography variant="body2" color="primary">
                  {formData.photo.name}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Submit Status */}
          {submitStatus && (
            <Grid item xs={12}>
              <Alert severity="success">{submitStatus}</Alert>
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  minHeight: '56px',
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Upload to Hub
              </Button>
            </Box>
          </Grid>

        </Grid>
      </form>
    </Paper>
  );
};

export default ChallanUploadForm;
