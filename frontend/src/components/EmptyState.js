import React from 'react';
import { Box, Typography } from '@mui/material';
import EmptyIllustration from './empty.svg';

function EmptyState({ title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <img 
        src={EmptyIllustration} 
        alt="No data" 
        style={{ width: '150px', opacity: 0.7, marginBottom: '16px' }}
      />
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