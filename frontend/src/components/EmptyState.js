import React from 'react';
import { Box, Typography } from '@mui/material';

function EmptyState({ title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    </Box>
  );
}

export default EmptyState;