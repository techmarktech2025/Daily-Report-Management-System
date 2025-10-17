import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40, 
  fullScreen = false,
  color = 'primary' 
}) => {
  const containerSx = fullScreen 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
      };

  return (
    <Box sx={containerSx}>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 2, 
            color: 'text.secondary',
            textAlign: 'center' 
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
