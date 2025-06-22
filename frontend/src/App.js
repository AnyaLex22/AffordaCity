import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function App() {
  // State declarations
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState(null);
  const [calculations, setCalculations] = useState([]);

  // Fetch cities on component mount
  // Replace your useEffect with this:
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get('/cities');
        setCities(response.data || []);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setCities([]); // Fallback to empty array
        // Optionally show error to user
      }
    };
    fetchCities();
  }, []);

  // Update your calculation handler:
  const handleCalculate = async () => {
    if (!selectedCity || !salary) return;

    try {
      const response = await apiClient.post('/calculate', {
        city: selectedCity,
        salary: parseFloat(salary)
      });
      
      setResult(response);
      setCalculations(prev => [...prev, {
        city: response.city,
        salary: salary,
        rent: response.estimatedMonthlyRent,
        affordability: response.affordability
      }]);
    } catch (err) {
      console.error('Calculation failed:', err);
      // Optionally show error to user
    }
  };

  // Delete calculation handler
  const handleDeleteCalculation = (index) => {
    const updatedCalculations = [...calculations];
    updatedCalculations.splice(index, 1);
    setCalculations(updatedCalculations);
  };

  // In App.js, replace the entire return statement with this:

  return (
    <div className="App">
      {/* Header Section */}
      <header className="App-header">
        <Typography variant="h3" gutterBottom>
          Afford City Calculator
        </Typography>
        <Typography variant="subtitle1">
          Compare cost of living between cities
        </Typography>
      </header>

      <Divider sx={{ my: 3 }} />

      {/* Calculator Section */}
      <section className="calculator-section">
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom>
            Cost Calculator
          </Typography>
          
          <Box component="form" sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select City</InputLabel>
                  <Select
                    label="Select City"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {Array.isArray(cities) && cities.map((city) => (
                      <MenuItem key={city._id} value={city.city}>
                        {`${city.city}, ${city.country}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Annual Salary (USD)"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCalculate}
                  sx={{ py: 2 }}
                >
                  Calculate Affordability
                </Button>
              </Grid>
            </Grid>
          </Box>

          {result && (
            <Box className="result-box" sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Results for {result.city}, {result.country}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Monthly Salary:</Typography>
                  <Typography fontWeight="bold">${result.monthlySalary.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Estimated Rent:</Typography>
                  <Typography fontWeight="bold">${result.estimatedMonthlyRent.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Living Costs:</Typography>
                  <Typography fontWeight="bold">${result.estimatedMonthlyLivingCost.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Disposable Income:</Typography>
                  <Typography 
                    fontWeight="bold"
                    color={result.disposableIncome > 0 ? 'success.main' : 'error.main'}
                  >
                    ${result.disposableIncome.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </section>

      <Divider sx={{ my: 3 }} />

      {/* My Calculations Section */}
      <section className="saved-calculations">
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom>
            My Saved Calculations
          </Typography>
          
          <List className="saved-list" sx={{ width: '100%', mt: 2 }}>
            {calculations.map((calc, index) => (
              <ListItem 
                key={index} 
                divider
                className={`saved-item ${calc.affordability.toLowerCase().includes('affordable') ? 'affordable' : 'not-affordable'}`}
              >
                <ListItemText
                  primary={`${calc.city} - ${calc.affordability}`}
                  secondary={`Salary: $${calc.salary} | Rent: $${calc.rent.toFixed(2)}`}
                />
                <IconButton edge="end" onClick={() => handleDeleteCalculation(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Container>
      </section>
    </div>
  );
  
}

export default App;