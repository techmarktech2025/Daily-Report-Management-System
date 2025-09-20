// src/Pages/Supervisor/Attendance/Attendance.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Place as PlaceIcon
} from '@mui/icons-material';

const Attendance = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    fullAddress: '',
    coordinates: null
  });
  
  const [locationStatus, setLocationStatus] = useState('idle');
  const [submitStatus, setSubmitStatus] = useState('');
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);

  // Check if geolocation is supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setDebugInfo('❌ Geolocation is not supported by this browser');
    } else {
      setDebugInfo('✅ Geolocation is supported');
    }
  }, []);

  // Reverse geocoding using multiple services for reliability
  const reverseGeocode = async (latitude, longitude) => {
    const services = [
      {
        name: 'OpenStreetMap Nominatim',
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        parser: (data) => ({
          formatted: data.display_name,
          street: data.address?.road || data.address?.pedestrian || '',
          area: data.address?.neighbourhood || data.address?.suburb || data.address?.area || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
          postcode: data.address?.postcode || ''
        })
      },
      {
        name: 'BigDataCloud (Backup)',
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        parser: (data) => ({
          formatted: data.locality || `${data.city}, ${data.principalSubdivision}`,
          street: data.localityInfo?.administrative?.[0]?.name || '',
          area: data.locality || '',
          city: data.city || '',
          state: data.principalSubdivision || '',
          country: data.countryName || '',
          postcode: data.postcode || ''
        })
      }
    ];

    for (const service of services) {
      try {
        setDebugInfo(`🌐 Getting address from ${service.name}...`);
        
        const response = await fetch(service.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const parsed = service.parser(data);
        
        if (parsed.formatted) {
          setDebugInfo(`✅ Address resolved using ${service.name}`);
          return parsed;
        }
      } catch (error) {
        console.warn(`${service.name} failed:`, error);
        setDebugInfo(`⚠️ ${service.name} failed, trying next service...`);
      }
    }
    
    // Fallback if all services fail
    setDebugInfo('⚠️ All geocoding services failed, using coordinates only');
    return {
      formatted: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      street: '',
      area: '',
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      postcode: ''
    };
  };

  const getCurrentLocation = () => {
    setDebugInfo('🔍 Checking geolocation support...');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setSubmitStatus('❌ Geolocation is not supported by this browser.');
      setShowLocationHelp(true);
      return;
    }

    setLocationStatus('loading');
    setSubmitStatus('📍 Getting your location... Please allow location access when prompted.');
    setDebugInfo('⏳ Requesting location permission...');

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        setDebugInfo(`✅ GPS Location obtained! Accuracy: ±${Math.round(accuracy)}m`);
        
        // Store coordinates immediately
        const coords = { lat: latitude, lng: longitude, accuracy };
        setFormData(prev => ({ ...prev, coordinates: coords }));
        
        try {
          // Get readable address
          setSubmitStatus('🌐 Getting address information...');
          const addressInfo = await reverseGeocode(latitude, longitude);
          
          // Create formatted location string
          let locationParts = [];
          if (addressInfo.street) locationParts.push(addressInfo.street);
          if (addressInfo.area) locationParts.push(addressInfo.area);
          if (addressInfo.city) locationParts.push(addressInfo.city);
          if (addressInfo.state) locationParts.push(addressInfo.state);
          
          const shortAddress = locationParts.slice(0, 3).join(', ') || addressInfo.formatted;
          
          setFormData(prev => ({
            ...prev,
            location: shortAddress,
            fullAddress: addressInfo.formatted
          }));
          
          setAddressDetails(addressInfo);
          setLocationStatus('success');
          setSubmitStatus('✅ Location and address captured successfully!');
          setDebugInfo(`✅ Complete! Address: ${shortAddress}`);
          
          // Clear success message after 5 seconds
          setTimeout(() => setSubmitStatus(''), 5000);
          
        } catch (error) {
          console.error('Error getting address:', error);
          setDebugInfo(`⚠️ Address lookup failed: ${error.message}`);
          
          // Still use coordinates even if address fails
          const coordsString = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`;
          setFormData(prev => ({
            ...prev,
            location: coordsString,
            fullAddress: coordsString
          }));
          
          setLocationStatus('success');
          setSubmitStatus('✅ Location captured (coordinates only - address lookup failed)');
        }
      },
      (error) => {
        setLocationStatus('error');
        let errorMessage = '';
        let debugMessage = '';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "❌ Location access denied. Click 'Help' for instructions.";
            debugMessage = "🚫 User denied location permission";
            setShowLocationHelp(true);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "❌ Location information is unavailable. Try again.";
            debugMessage = "📍 Position unavailable from device";
            break;
          case error.TIMEOUT:
            errorMessage = "❌ Location request timed out. Try again.";
            debugMessage = "⏰ Location request timeout after 15 seconds";
            break;
          default:
            errorMessage = "❌ Unknown location error occurred.";
            debugMessage = `❓ Unknown error: ${error.message}`;
            break;
        }
        
        setSubmitStatus(errorMessage);
        setDebugInfo(debugMessage);
        console.error('Geolocation error:', error);
      },
      options
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.trim()) {
      setSubmitStatus('❌ Please get your current location first.');
      return;
    }

    setLocationStatus('loading');
    setSubmitStatus('⏳ Submitting attendance...');
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const attendanceData = {
        date: formData.date,
        location: formData.location,
        fullAddress: formData.fullAddress,
        coordinates: formData.coordinates,
        addressDetails: addressDetails,
        timestamp: new Date().toISOString(),
        accuracy: formData.coordinates?.accuracy
      };
      
      console.log('Attendance submitted:', attendanceData);
      
      setLocationStatus('success');
      setSubmitStatus('✅ Attendance submitted successfully!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitStatus('');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          location: '',
          fullAddress: '',
          coordinates: null
        });
        setAddressDetails(null);
        setLocationStatus('idle');
        setDebugInfo('');
      }, 3000);
      
    } catch (error) {
      setLocationStatus('error');
      setSubmitStatus('❌ Failed to submit attendance. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#000', mb: 4 }}>
        Attendance
      </Typography>

      {/* Debug Info */}
      {debugInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Status:</strong> {debugInfo}
          </Typography>
        </Alert>
      )}

      {/* Main Form */}
      <Paper elevation={0} sx={{ p: 0, backgroundColor: 'transparent' }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
          
          {/* Date Picker */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '1rem', color: '#000' }}>
              Date picker
            </Typography>
            <TextField
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '60px', backgroundColor: 'white' } }}
            />
          </Box>

          {/* Location */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '1rem', color: '#000' }}>
              Location
            </Typography>
            <TextField
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Click the location icon to get your current location with address"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton
                        onClick={getCurrentLocation}
                        disabled={locationStatus === 'loading'}
                        title="Get Current Location & Address"
                        sx={{ 
                          color: locationStatus === 'success' ? 'success.main' : 'primary.main',
                          '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                        }}
                      >
                        {locationStatus === 'loading' ? (
                          <CircularProgress size={24} />
                        ) : locationStatus === 'success' ? (
                          <LocationIcon />
                        ) : (
                          <MyLocationIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => setShowLocationHelp(true)}
                        title="Location Help"
                        sx={{ color: 'info.main' }}
                        size="small"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: '100px', backgroundColor: 'white' } }}
            />
            
            {/* Location Details */}
            {addressDetails && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
                  <PlaceIcon sx={{ mr: 1, fontSize: 18 }} />
                  Location Details
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {addressDetails.city && <Chip label={`City: ${addressDetails.city}`} size="small" variant="outlined" />}
                  {addressDetails.state && <Chip label={`State: ${addressDetails.state}`} size="small" variant="outlined" />}
                  {addressDetails.country && <Chip label={`Country: ${addressDetails.country}`} size="small" variant="outlined" />}
                  {formData.coordinates && (
                    <Chip 
                      label={`Accuracy: ±${Math.round(formData.coordinates.accuracy)}m`} 
                      size="small" 
                      color="success" 
                    />
                  )}
                </Box>
                {formData.coordinates && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </Typography>
                )}
                {formData.fullAddress && formData.fullAddress !== formData.location && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      <strong>Full Address:</strong> {formData.fullAddress}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Status Message */}
          {submitStatus && (
            <Box sx={{ mb: 4 }}>
              <Alert 
                severity={
                  submitStatus.includes('✅') || submitStatus.includes('✓') ? 'success' : 
                  submitStatus.includes('⏳') || submitStatus.includes('📍') || submitStatus.includes('🌐') ? 'info' : 'error'
                }
                sx={{ fontSize: '1rem' }}
              >
                {submitStatus}
              </Alert>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={locationStatus === 'loading' || !formData.location.trim()}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: '#2196f3',
              minHeight: '60px',
              '&:hover': { backgroundColor: '#1976d2' },
              '&:disabled': { backgroundColor: '#ccc' }
            }}
          >
            {locationStatus === 'loading' ? 'Getting Location & Address...' : 'Submit'}
          </Button>

        </Box>
      </Paper>

      {/* Location Help Dialog */}
      <Dialog open={showLocationHelp} onClose={() => setShowLocationHelp(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Location Access Help
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>To enable location access:</strong>
          </Typography>
          
          <Box component="ol" sx={{ pl: 2, mb: 2 }}>
            <li>Look for the location icon 📍 in your browser's address bar</li>
            <li>Click on it and select "Always allow" or "Allow"</li>
            <li>Refresh the page and try again</li>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Features you'll get:</strong>
          </Typography>
          <ul>
            <li>Precise GPS coordinates</li>
            <li>Full street address</li>
            <li>City, state, and country information</li>
            <li>Accuracy measurement</li>
          </ul>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> We use multiple geocoding services to ensure reliable address resolution.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLocationHelp(false)} variant="contained">
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Attendance;
