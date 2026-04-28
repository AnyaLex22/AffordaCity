import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from './api/client';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [busy, setBusy] = useState(false);

  const clearMsgs = () => { setError(null); setInfo(null); setUnverifiedEmail(null); };

  const login = async () => {
    clearMsgs();
    setBusy(true);
    try {
      const res = await apiClient.post('/login', { email, password });
      localStorage.setItem('token', res.token);
      onLogin();
    } catch (err) {
      const data = err.data || {};
      if (data.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email || email);
        setError('Please verify your email before logging in.');
      } else {
        setError(data.error || data.message || err.message || 'Login failed');
      }
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    clearMsgs();
    setBusy(true);
    try {
      const res = await apiClient.post('/register', { name, email, password });
      setInfo(res.message || 'Account created. Check your email to verify your account.');
      setUnverifiedEmail(email);
      setIsRegister(false);
    } catch (err) {
      const data = err.data || {};
      setError(data.message || err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    if (!unverifiedEmail) return;
    setBusy(true);
    try {
      const res = await apiClient.post('/resend-verification', { email: unverifiedEmail });
      setInfo(res.message || 'Verification email resent.');
    } catch (err) {
      setError(err.message || 'Could not resend verification email');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    display: 'block', marginBottom: 12, width: '100%', padding: 10,
    border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box',
  };

  return (
    <div style={{
      maxWidth: 400, margin: '5% auto', padding: 30,
      backgroundColor: '#f5f7fa', borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        {isRegister ? 'Register New Account' : 'Login'}
      </h2>

      {info && (
        <div style={{ background: '#e8f5e9', color: '#1b5e20', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
          {info}
        </div>
      )}
      {error && (
        <div style={{ background: '#ffebee', color: '#b71c1c', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
          {error}
          {unverifiedEmail && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={resendVerification}
                disabled={busy}
                style={{ background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 14 }}
              >
                Resend verification email
              </button>
            </div>
          )}
        </div>
      )}

      {isRegister && (
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      )}
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

      <button
        onClick={isRegister ? register : login}
        disabled={busy}
        style={{
          width: '100%', padding: 12, marginBottom: 10,
          backgroundColor: '#1976d2', color: '#fff', border: 'none',
          borderRadius: 6, fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
          opacity: busy ? 0.7 : 1
        }}
      >
        {busy ? 'Please wait...' : isRegister ? 'Register' : 'Log In'}
      </button>

      {!isRegister && (
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: '#1976d2' }}>Forgot password?</Link>
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 14 }}>
        {isRegister ? (
          <p>Already have an account?{' '}
            <button
              onClick={() => { setIsRegister(false); clearMsgs(); }}
              style={{ background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 14 }}
            >Login</button>
          </p>
        ) : (
          <p>New user?{' '}
            <button
              onClick={() => { setIsRegister(true); clearMsgs(); }}
              style={{ background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 14 }}
            >Register here</button>
          </p>
        )}
      </div>
    </div>
  );
}
