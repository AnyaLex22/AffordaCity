import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import apiClient from './api/client';
import {
  Typography, Button, TextField, MenuItem,
  Grid, Divider, List, ListItem, ListItemText,
  IconButton, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmptyState from './components/EmptyState';
import logo from './assets/Affordacity.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$' });
  const [result, setResult] = useState(null);
  const [savedCalcs, setSavedCalcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTimestamp, setEditingTimestamp] = useState(null);
  const [editSalary, setEditSalary] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    apiClient.get('/countries')
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to fetch countries:', err));
    fetchSavedCalcs();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!country) return;
    setCity('');
    setCities([]);
    apiClient.get(`/cities-by-country?country=${encodeURIComponent(country)}`)
      .then(data => setCities(data))
      .catch(err => console.error('Failed to fetch cities:', err));

    apiClient.get(`/currency?country=${encodeURIComponent(country)}`)
      .then(data => setCurrency(data))
      .catch(err => console.error('Failed to fetch currency:', err));
  }, [country]);

  const fetchSavedCalcs = () => {
    apiClient.get('/user-calculations')
      .then(data => setSavedCalcs(data))
      .catch(err => console.error('Failed to fetch saved calculations:', err));
  };

  const handleCalculate = async () => {
    if (!city || !country || !salary) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.post('/calculate', { city, country, salary: parseFloat(salary) });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await apiClient.post('/save-calculation', {
        ...result,
        salary: parseFloat(salary),
        timestamp: new Date().toISOString(),
      });
      fetchSavedCalcs();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    }
  };

  const handleDelete = async (timestamp) => {
    try {
      await apiClient.delete('/delete-calculation', { data: { timestamp } });
      setSavedCalcs(prev => prev.filter(c => c.timestamp !== timestamp));
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const handleEdit = async (timestamp) => {
    try {
      await apiClient.put('/update-calculation', {
        timestamp,
        salary: parseFloat(editSalary),
      });
      setEditingTimestamp(null);
      setEditSalary('');
      fetchSavedCalcs();
    } catch (err) {
      setError(err.message || 'Failed to update.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setResult(null);
    setSavedCalcs([]);
  };

  const fmt = (val, sym) =>
    `${sym}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="container nav-inner">
          <img src={logo} alt="AffordaCity" className="brand-logo" />
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container main-content">
        <div className="hero">
          <Typography variant="h3" component="h1" fontWeight={700}>AffordaCity</Typography>
          <Typography className="subtitle1" variant="subtitle1">
            Find out if you can afford to live in your dream city
          </Typography>
        </div>

        <div className="calculator-section">
          <Typography variant="h5">Cost of Living Calculator</Typography>
          {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Country"
                value={country} onChange={e => setCountry(e.target.value)}
              >
                {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="City"
                value={city} onChange={e => setCity(e.target.value)}
                disabled={!country || cities.length === 0}
              >
                {cities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label={`Annual Salary (${currency.code})`}
                type="number" value={salary}
                onChange={e => setSalary(e.target.value)}
                InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>{currency.symbol}</span> }}
              />
            </Grid>
          </Grid>

          <Button variant="contained" sx={{ mt: 2 }} onClick={handleCalculate} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Calculate'}
          </Button>

          {result && (
            <div className="result-box">
              <Typography variant="h6">Results for {result.city}, {result.country}</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  ['Monthly Salary', result.monthlySalary],
                  ['Est. Monthly Rent', result.estimatedMonthlyRent],
                  ['Est. Living Cost', result.estimatedMonthlyLivingCost],
                  ['Disposable Income', result.disposableIncome],
                ].map(([label, val]) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Typography variant="body2" color="textSecondary">{label}</Typography>
                    <Typography variant="h6">{fmt(val, result.currencySymbol)}</Typography>
                  </Grid>
                ))}
              </Grid>
              <Typography
                sx={{ mt: 2, fontWeight: 700 }}
                className={result.affordability === 'Affordable' ? 'affordable' : 'not-affordable'}
              >
                {result.affordability}
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleSave}>
                Save Calculation
              </Button>
            </div>
          )}
        </div>

        <Divider />

        <div className="saved-calculations">
          <Typography variant="h5">Saved Calculations</Typography>
          {savedCalcs.length === 0 ? (
            <EmptyState
              title="No saved calculations yet"
              subtitle="Run a calculation above and save it to see it here."
            />
          ) : (
            <List className="saved-list">
              {savedCalcs.map((calc) => (
                <ListItem
                  key={calc.timestamp}
                  className="saved-item"
                  secondaryAction={
                    <>
                      <IconButton onClick={() => { setEditingTimestamp(calc.timestamp); setEditSalary(calc.salary); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(calc.timestamp)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={`${calc.city}, ${calc.country}`}
                    secondary={
                      <>
                        <span>Salary: {fmt(calc.salary, calc.currencySymbol || '$')} {calc.currencyCode} / yr</span>
                        <br />
                        <span>Rent: {fmt(calc.estimatedMonthlyRent, calc.currencySymbol || '$')}/mo - </span>
                        <span>Living: {fmt(calc.estimatedMonthlyLivingCost, calc.currencySymbol || '$')}/mo - </span>
                        <span className={calc.affordability === 'Affordable' ? 'affordable' : 'not-affordable'}>
                          {calc.affordability}
                        </span>
                      </>
                    }
                  />
                  {editingTimestamp === calc.timestamp && (
                    <Grid container spacing={1} sx={{ mt: 1, maxWidth: 300 }}>
                      <Grid item xs={8}>
                        <TextField
                          size="small" type="number"
                          label="New Salary" value={editSalary}
                          onChange={e => setEditSalary(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Button size="small" variant="contained" onClick={() => handleEdit(calc.timestamp)}>
                          Save
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <img src={logo} alt="AffordaCity" className="brand-logo footer-logo" />
          <Typography variant="body2">© 2026 AffordaCity. All rights reserved.</Typography>
        </div>
      </footer>
    </div>
  );
}

export default App;
