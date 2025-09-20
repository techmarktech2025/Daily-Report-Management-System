// src/Pages/MaterialRequests/components/MaterialRequestCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const priorityColor = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
};

const MaterialRequestCard = ({ request }) => (
  <Card elevation={3} sx={{ borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {request.projectName}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.8 }}>
          {request.id}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <b>Supervisor:</b> {request.supervisorName}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <b>Material:</b> {request.materialName}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <b>Quantity:</b> {request.quantity}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography variant="body1">
          <b>Priority:</b>
        </Typography>
        <Chip
          label={request.priority}
          color={priorityColor[request.priority] || 'default'}
          size="small"
          sx={{ ml: 1, fontWeight: 600 }}
        />
      </Box>
    </CardContent>
  </Card>
);

export default MaterialRequestCard;
