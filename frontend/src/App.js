import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import {Container, Typography, Box, Divider, Grid, FormControl, InputLabel, 
  Select, MenuItem, TextField, Button, List, ListItem, ListItemText, IconButton, 
  CircularProgress, Chip, Alert, Snackbar
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiClient from './api/client';
import { jwtDecode } from 'jwt-decode';

function App() {
  //login
  const [loggedIn, setLoggedIn] = useState(false);
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSalary, setEditedSalary] = useState('');

  //success/error/info messages - bottom right prompt
  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };


  useEffect(() => {
    // Check for valid JWT on app load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          localStorage.removeItem('token');
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
        }
      } catch (e) {
        localStorage.removeItem('token');
        setLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchUserCalculations();
    }
  }, [loggedIn]);

const fetchUserCalculations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Token missing in fetchUserCalculations');
    return;
  }
    try {
      const response = await apiClient.get('/user-calculations');
      setCalculations(response.data || []);
    } catch (err) {
      console.error('Failed to load user calculations:', err);
      showSnackbar('Could not load your history', 'error');
    }
  };

  
  // Fetch cities on component mount -fetches cities from backend
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(prev => ({...prev, cities: true}));
      setError(null);
      try {
        const response = await apiClient.get('/cities');
        setCities(response.cities || []);
        console.log('API Response:', response);

        //setCities(Array.isArray(response.data) ? response.data : []);
        //const citiesData = response?.data?.cities || response?.cities || [];
        //setCities(citiesData);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
  };

  if (!loggedIn) {
  return <LoginPage onLogin={() => setLoggedIn(true)} />;
}



  // Calculation handler
  const handleCalculate = async () => {
    if (!selectedCity || !salary) return;

    setIsLoading(prev => ({ ...prev, calculation: true }));
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      const data = await apiClient.post('/calculate', {
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

      await apiClient.post('/save-calculation', {
        city: data.city,
        country: data.country,
        salary: parseFloat(salary),
        estimatedMonthlyRent: data.estimatedMonthlyRent,
        estimatedMonthlyLivingCost: data.estimatedMonthlyLivingCost,
        disposableIncome: data.disposableIncome,
        affordability: data.affordability,
        timestamp: timestamp,
      });

      console.log('Calculation saved to DB');

      // ✅ Re-fetch all user calculations again to keep synced
      fetchUserCalculations();


      showSnackbar('Calculation successful!', 'success');
    } catch (err) {
      console.error('Calculation failed:', err);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  //edit handler
  const handleEditCalculation = (index) => {
    setEditingIndex(index);
    setEditedSalary(calculations[index].salary);
  };

  //save edited to db
  const handleSaveEditedCalculation = async () => {
    if (editingIndex === null || !editedSalary || editedSalary <= 0) return;

    const updated = [...calculations];
    const edited = { ...updated[editingIndex], salary: editedSalary };

    // Optionally, re-calculate affordability here if needed
    updated[editingIndex] = edited;
    setCalculations(updated);
    setEditingIndex(null);
    setEditedSalary('');

    try {
      await apiClient.put('/update-calculation', {
        timestamp: edited.timestamp, // identifier
        salary: parseFloat(editedSalary),
      });
      fetchUserCalculations();

      showSnackbar('Calculation updated!', 'success');
    } catch (err) {
      console.error('Failed to update calculation:', err);
      showSnackbar('Failed to update calculation in DB', 'error');
    }
  };


  // Delete calculation handler
  const handleDeleteCalculation = async (index) => {
    const updatedCalculations = [...calculations];
    updatedCalculations.splice(index, 1);

    setCalculations(updatedCalculations);

    try {
      await apiClient.delete('/delete-calculation', {
        data: { timestamp: calculations[index].timestamp }
      });

     await fetchUserCalculations();
    showSnackbar('Calculation removed', 'info');
  }  catch (err) {
    console.error('Delete failed:', err);
    showSnackbar('Failed to delete calculation', 'error');
  }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({...prev, open: false}));
  };

  //Render components
  return (
    <div className="App">
      {/* Header Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          py: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
            sx={{ height: 40, mt: { xs: 2, sm: 0 } }}
          >
            Logout
          </Button>

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
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel id="select-city-label">Select Location</InputLabel>
                  <Select
                    labelId="select-city-label"
                    id="select-city"
                    label="Select Location"
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

              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Annual Salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  disabled={isLoading.calculation}
                   error={!!(salary && salary <= 0)}
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
                          {editingIndex === index ? (
                            <>
                              <TextField
                                type="number"
                                size="small"
                                value={editedSalary}
                                onChange={(e) => setEditedSalary(e.target.value)}
                                sx={{ width: 120, mr: 2 }}
                                error={!!(editedSalary && editedSalary <= 0)}
                                helperText={editedSalary && editedSalary <= 0 ? 'Invalid' : ''}
                                InputProps={{ startAdornment: <Typography>$</Typography> }}
                              />
                              <Typography component="span" variant="body2">
                                Rent: ${calc.estimatedMonthlyRent.toFixed(2)}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography component="span" variant="body2">
                                Salary: ${calc.salary}
                              </Typography>
                              {' • '}
                              <Typography component="span" variant="body2">
                                Rent: ${calc.estimatedMonthlyRent.toFixed(2)}
                              </Typography>
                            </>
                          )}
                        </>
                      }

                    />
                    {editingIndex === index ? (
                      <IconButton 
                        edge="end" 
                        color="primary" 
                        onClick={handleSaveEditedCalculation}
                        disabled={isLoading.calculation}
                      >
                        <Typography variant="button">Save</Typography>
                      </IconButton>
                    ) : (
                      <IconButton 
                        edge="end" 
                        color="primary" 
                        onClick={() => handleEditCalculation(index)}
                        disabled={isLoading.calculation}
                      >
                        <Typography variant="button">Edit</Typography>
                      </IconButton>
                    )}

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