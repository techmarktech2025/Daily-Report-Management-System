// src/Pages/Supervisor/Outward/Outward.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CallMade as OutwardIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const Outward = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    supplierName: '',
    challanNo: '',
    isCorrect: false,
    remarks: '',
    areaInUse: '',
    uploadedPhoto: null,
    vehicleNo: ''

  });
  
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challans, setChallans] = useState([]);

  useEffect(() => {
    // Generate auto challan number
    setFormData(prev => ({
      ...prev,
      challanNo: generateChallanNo()
    }));
    fetchChallans();
  }, []);

  const generateChallanNo = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `OUT${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${timestamp}`;
  };

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/outward-challans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      const data = await response.json();
      setChallans(data);
    } catch (error) {
      console.error('Error fetching challans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitStatus('❌ Please upload only image files');
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        uploadedPhoto: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['materialName', 'quantity', 'unit', 'supplierName', 'areaInUse', 'vehicleNo'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setSubmitStatus(`❌ Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setTimeout(() => setSubmitStatus(''), 3000);
        return;
      }
    }

    if (!formData.uploadedPhoto) {
      setSubmitStatus('❌ Please upload dispatch photo');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('💾 Processing outward entry...');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'uploadedPhoto') {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('photo', formData.uploadedPhoto);
      formDataToSend.append('projectId', user?.assignedProjects?.[0]?.id);
      formDataToSend.append('supervisorId', user?.id);

      const response = await fetch('/api/outward-challans', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Reset form
        setFormData({
          materialName: '',
          quantity: '',
          unit: '',
          supplierName: '',
          challanNo: generateChallanNo(),
          isCorrect: false,
          remarks: '',
          areaInUse: '',
          uploadedPhoto: null,
           vehicleNo: ''

        });
        
        const fileInput = document.getElementById('photo-upload');
        if (fileInput) fileInput.value = '';

        setSubmitStatus('✅ Outward entry successful! PDF generated.');
        fetchChallans();
        setTimeout(() => setSubmitStatus(''), 3000);
      } else {
        throw new Error('Failed to process outward');
      }

    } catch (error) {
      setSubmitStatus('❌ Failed to process outward. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewPDF = (challanId) => {
    window.open(`/api/outward-challans/${challanId}/pdf`, '_blank');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 4 }}>
        Outward
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<OutwardIcon />} iconPosition="start" label="Material Outward" />
          <Tab icon={<PdfIcon />} iconPosition="start" label="View Challans" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            Material Outward Entry
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Material Name
                </Typography>
                <TextField
                  name="materialName"
                  value={formData.materialName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Challan No (AI)
                </Typography>
                <TextField
                  name="challanNo"
                  value={formData.challanNo}
                  disabled
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px', backgroundColor: '#f0f0f0' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Quantity
                </Typography>
                <TextField
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  type="number"
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                />
              </Grid>
               <Grid item xs={12} md={6}>
                              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                Vehicle No
                              </Typography>
                              <TextField
                                name="vehicleNo"
                                value={formData.vehicleNo}
                                onChange={handleInputChange}
                                fullWidth
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                              />
                            </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Unit
                </Typography>
                <TextField
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Supplier Name
                </Typography>
                <TextField
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Area in use
                </Typography>
                <TextField
                  name="areaInUse"
                  value={formData.areaInUse}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Upload Photo
                </Typography>
                <Card
                  sx={{
                    border: '2px dashed #ccc',
                    cursor: 'pointer',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { borderColor: '#1976d2' }
                  }}
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <UploadIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2">
                      {formData.uploadedPhoto ? formData.uploadedPhoto.name : 'Upload'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Verification & Remarks
                </Typography>
                <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, minHeight: '120px' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isCorrect"
                        checked={formData.isCorrect}
                        onChange={handleInputChange}
                      />
                    }
                    label="Material dispatch is correct"
                  />
                  <TextField
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Remarks (right or wrong)"
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              {submitStatus && (
                <Grid item xs={12}>
                  <Alert severity={submitStatus.includes('✅') ? 'success' : 'error'}>
                    {submitStatus}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 2, fontSize: '1.1rem', minHeight: '56px' }}
                >
                  {isSubmitting ? 'Processing...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Outward Challans ({challans.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Challan No</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {challans.map((challan) => (
                  <TableRow key={challan.id}>
                    <TableCell>{challan.challanNo}</TableCell>
                    <TableCell>{challan.materialName}</TableCell>
                    <TableCell>{challan.quantity} {challan.unit}</TableCell>
                    <TableCell>{challan.supplierName}</TableCell>
                    <TableCell>{new Date(challan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={challan.isCorrect ? 'Verified' : 'Pending'} 
                        color={challan.isCorrect ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => viewPDF(challan.id)} color="primary">
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default Outward;
