// src/components/common/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="50vh"
    gap={2}
  >
    <CircularProgress size={48} />
    <Typography variant="body1" color="textSecondary">
      {message}
    </Typography>
  </Box>
);

export default LoadingSpinner;
