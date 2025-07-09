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
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>{isRegister ? 'Register New Account' : 'Login'}</h2>

      {isRegister && (
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: 20, width: '100%' }}
      />

      <button onClick={isRegister ? register : login} style={{ marginBottom: 10 }}>
        {isRegister ? 'Register' : 'Log In'}
      </button>

      <div>
        {isRegister ? (
          <p>
            Already have an account?{' '}
            <button onClick={() => setIsRegister(false)}>Login</button>
          </p>
        ) : (
          <p>
            New user?{' '}
            <button onClick={() => setIsRegister(true)}>Register here</button>
          </p>
        )}
      </div>
    </div>
  );
}