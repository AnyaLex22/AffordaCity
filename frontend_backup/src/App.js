import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function App() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('/api/cities');
        setCities(response.data);
      } catch (err) {
        setError('Failed to fetch cities');
      }
    };
    fetchCities();
  }, []);

  const handleCalculate = async () => {
    if (!selectedCity || !salary) {
      setError('Please select a city and enter your salary');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/calculate', {
        city: selectedCity,
        salary: parseFloat(salary)
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Can I Afford This City?
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="city-select-label">Select City</InputLabel>
            <Select
              labelId="city-select-label"
              value={selectedCity}
              label="Select City"
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <MenuItem key={city.city} value={city.city}>
                  {city.city}, {city.country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Your Annual Salary (USD)"
            variant="outlined"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculate Affordability'}
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
        </Box>

        {result && (
          <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="h5" gutterBottom>
              Results for {result.city}, {result.country}
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Typography>Monthly Salary:</Typography>
              <Typography fontWeight="bold">${result.monthlySalary.toFixed(2)}</Typography>
              
              <Typography>Estimated Monthly Rent:</Typography>
              <Typography fontWeight="bold">${result.estimatedMonthlyRent.toFixed(2)}</Typography>
              
              <Typography>Estimated Living Costs:</Typography>
              <Typography fontWeight="bold">${result.estimatedMonthlyLivingCost.toFixed(2)}</Typography>
              
              <Typography>Disposable Income:</Typography>
              <Typography 
                fontWeight="bold" 
                color={result.disposableIncome > 0 ? 'success.main' : 'error.main'}
              >
                ${result.disposableIncome.toFixed(2)}
              </Typography>
              
              <Typography>Affordability:</Typography>
              <Typography 
                fontWeight="bold" 
                color={result.affordability === 'affordable' ? 'success.main' : 'error.main'}
              >
                {result.affordability.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;