import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    setError(null);
    try {
      const data = await apiClient.post('/forgot-password', { email });
      setInfo(data.message || 'If that account exists, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ maxWidth: 420, mx: 'auto', mt: 10, p: 4, bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>Forgot Password</Typography>
      <Typography sx={{ mb: 3, color: '#666', textAlign: 'center', fontSize: 14 }}>
        Enter your email and we'll send you a link to reset your password.
      </Typography>

      {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Send reset link'}
      </Button>

      <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14 }}>
        <Link to="/">Back to Login</Link>
      </Typography>
    </Box>
  );
}
