import React, { useState } from 'react';
import axios from './client';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false); // Toggle between login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration only

  const login = async () => {
    try {
      const res = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      alert('Login failed');
    }
  };

  const register = async () => {
    try {
      const res = await axios.post('/api/register', { name, email, password });
      alert('Registration successful. You can now log in.');
      setIsRegister(false); // Switch to login mode
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '5% auto',
      padding: 30,
      backgroundColor: '#f5f7fa',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>

      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        {isRegister ? 'Register New Account' : 'Login'}
      </h2>

      {isRegister && (
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: 'block',
            marginBottom: 12,
            width: '100%',
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 6
          }}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
         style={{
          display: 'block',
          marginBottom: 12,
          width: '100%',
          padding: 10,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          display: 'block',
          marginBottom: 20,
          width: '100%',
          padding: 10,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />

      <button 
        onClick={isRegister ? register : login} 
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 15,
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
        {isRegister ? 'Register' : 'Log In'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 14 }}>
        {isRegister ? (
          <p>
            Already have an account?{' '}
            <button 
            onClick={() => setIsRegister(false)}
            style={{
                background: 'none',
                color: '#1976d2',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: 14
              }}
              >Login</button>
          </p>
        ) : (
          <p>
            New user?{' '}
            <button 
            onClick={() => setIsRegister(true)}
            style={{
                background: 'none',
                color: '#1976d2',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: 14
              }}
              >Register here</button>
          </p>
        )}
      </div>
    </div>
  );
}