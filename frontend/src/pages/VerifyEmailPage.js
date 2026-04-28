import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    apiClient
      .get(`/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email verified! You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed.');
      });
  }, [params]);

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 10, p: 4, textAlign: 'center', bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Email Verification</Typography>

      {status === 'loading' && <CircularProgress />}
      {status === 'success' && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {status === 'error' && <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>}

      {status !== 'loading' && (
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 1 }}>
          Go to Login
        </Button>
      )}

      <Typography sx={{ mt: 3, fontSize: 14 }}>
        <Link to="/">Back to Login</Link>
      </Typography>
    </Box>
  );
}
