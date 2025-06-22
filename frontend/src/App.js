import React, { useState, useEffect } from 'react';
import {Container, Typography, Box, Divider, Grid, FormControl, InputLabel, 
  Select, MenuItem, TextField, Button, List, ListItem, ListItemText, IconButton, 
  CircularProgress, Chip, Alert, Snackbar
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiClient from './api/client';


function App() {
  // State declarations
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState({
    cities: false,
    calculation: false
  });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Fetch cities on component mount -fetches cities from backend
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(prev => ({...prev, cities: true}));
      setError(null);
      try {
        const response = await apiClient.get('api/cities');
        setCities(response.cities || []);
        console.log('API Response:', response);

        //setCities(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to fetch:', err.response); 
        setError(err.message);
        showSnackbar(err.message, 'error');
      } finally {
        setIsLoading(prev => ({...prev, cities: false}));
      }
    };
    fetchCities();
  }, []);

  //success/error/info messages - bottom right prompt
  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Calculation handler
  const handleCalculate = async () => {
    if (!selectedCity || !salary) return;

    setIsLoading(prev => ({ ...prev, calculation: true }));
    setError(null);

    try {
      const data = await apiClient.post('api/calculate', {
        city: selectedCity,
        salary: parseFloat(salary),
      });

      console.log('Received data:', data);

      if (
        !data ||
        typeof data.estimatedMonthlyRent !== 'number' ||
        typeof data.disposableIncome !== 'number'
      ) {
        throw new Error('Incomplete data from the server.');
      }

      setResult(data);

      setCalculations(prev => [
        ...prev,
        {
          city: selectedCity,
          salary: salary,
          rent: data.estimatedMonthlyRent ?? 0,
          affordability: data.affordability ?? 'Unknown',
          timestamp: new Date().toISOString(),
        },
      ]);

      try {
        await apiClient.post('api/save-calculation', {
          city: data.city,
          country: data.country,
          salary: parseFloat(salary),
          estimatedMonthlyRent: data.estimatedMonthlyRent,
          estimatedMonthlyLivingCost: data.estimatedMonthlyLivingCost,
          disposableIncome: data.disposableIncome,
          affordability: data.affordability,
          timestamp: new Date().toISOString()
        });

        console.log('Calculation saved to DB');
      } catch (saveErr) {
        console.error('Failed to save calculation to DB:', saveErr);
      }


      showSnackbar('Calculation successful!', 'success');
    } catch (err) {
      console.error('Calculation failed:', err);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, calculation: false }));
    }
  };


  // Delete calculation handler
  const handleDeleteCalculation = (index) => {
    const updatedCalculations = [...calculations];
    updatedCalculations.splice(index, 1);
    setCalculations(updatedCalculations);
    showSnackbar('Calculation removed', 'info');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({...prev, open: false}));
  };

  //Render components
  return (
    <div className="App">
      {/* Header Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            AffordCity - Can You Afford Your Dream City?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            "Compare your salary with real cost of living data from around the world. Calculate if you can afford to live in your dream city with our comprehensive affordability calculator."
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Error Display - if fetching cities/calculating fails, retry button */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Calculator Section */}
        <Box className="calculator-section" sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 4,
          mb: 4
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Cost Calculator
          </Typography>
          
          <Box component="form" sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Location</InputLabel>
                  <Select
                    label="Select City"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={isLoading.cities}
                  >
                    {isLoading.cities ? (
                      <MenuItem disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 2 }} />
                          Loading cities...
                        </Box>
                      </MenuItem>
                    ) : cities.length > 0 ? (
                      cities.map((city) => (
                        <MenuItem key={city._id} value={city.city}>
                          {`${city.city}, ${city.country}`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No cities available
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Annual Salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={isLoading.calculation}
                  error={salary && salary <= 0}
                  helperText={salary && salary <= 0 ? 'Salary must be positive' : ''}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              
              <Grid xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCalculate}
                  sx={{ py: 2, mt: 1 }}
                  disabled={isLoading.calculation || !selectedCity || !salary || (salary && salary <= 0)}
                  startIcon={isLoading.calculation ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading.calculation ? 'Calculating...' : 'Calculate Affordability'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/*calculations result*/}
          {result && (
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              backgroundColor: 'background.default',
              borderRadius: 2,
              borderLeft: `4px solid ${
                result.affordability.toLowerCase().includes('affordable') 
                  ? 'success.main' 
                  : 'error.main'
              }`
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Results for {result.city}, {result.country}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Chip 
                    label={result.affordability} 
                    color={result.affordability.toLowerCase().includes('affordable') ? 'success' : 'error'}
                    sx={{ mb: 2, fontWeight: 600 }}
                  />
                </Grid>
                
                {[
                  { label: 'Monthly Salary', value: result.monthlySalary.toFixed(2) },
                  { label: 'Estimated Rent', value: result.estimatedMonthlyRent.toFixed(2) },
                  { label: 'Living Costs', value: result.estimatedMonthlyLivingCost.toFixed(2) },
                  { label: 'Disposable Income', value: result.disposableIncome.toFixed(2), 
                    color: result.disposableIncome > 0 ? 'success.main' : 'error.main' }
                ].map((item, index) => (
                  <Grid xs={12} sm={6} key={index}>
                    <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="h6" fontWeight="bold" color={item.color || 'text.primary'}>
                        ${item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/*Saved Calculations Section */}
        <Box className="saved-calculations" sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 4,
          mb: 4
        }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            My Saved Calculations
          </Typography>
          
          {calculations.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              p: 4,
              backgroundColor: 'background.default',
              borderRadius: 2
            }}>
              <Typography variant="body1" color="text.secondary">
                No calculations saved yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your calculations will appear here after you run them
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', mt: 2 }}>
              {calculations
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((calc, index) => (
                  <ListItem 
                    key={index} 
                    sx={{
                      p: 3,
                      mb: 2,
                      backgroundColor: 'background.default',
                      borderRadius: 2,
                      borderLeft: `4px solid ${
                        calc.affordability.toLowerCase().includes('affordable') 
                          ? 'success.main' 
                          : 'error.main'
                      }`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 1
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                            {calc.city}
                          </Typography>
                          <Chip 
                            label={calc.affordability} 
                            size="small"
                            color={calc.affordability.toLowerCase().includes('affordable') ? 'success' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Salary: ${calc.salary}
                          </Typography>
                          {' • '}
                          <Typography component="span" variant="body2">
                            Rent: ${calc.rent.toFixed(2)}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDeleteCalculation(index)}
                      disabled={isLoading.calculation}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
            </List>
          )}
        </Box>
      </Container>

      {/* Notifications Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;