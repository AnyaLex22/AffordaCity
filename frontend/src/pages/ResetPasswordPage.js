import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.post('/reset-password', { token, password });
      setSuccess(data.message || 'Password updated. Redirecting to login...');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ maxWidth: 420, mx: 'auto', mt: 10, p: 4, bgcolor: '#f5f7fa', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>Reset Password</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" fullWidth disabled={loading || !!success} sx={{ py: 1.5 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
      </Button>

      <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14 }}>
        <Link to="/">Back to Login</Link>
      </Typography>
    </Box>
  );
}
