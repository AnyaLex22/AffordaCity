await apiClient.post('/api/calculate', { city, salary });

if (!data || !data.estimatedMonthlyRent) {
  console.error('Invalid data returned:', data);
  return;
}

console.log(data?.estimatedMonthlyRent);

app.post('/api/calculate', async (req, res) => {
  try {
    const { city, salary } = req.body;

    if (!city || typeof salary !== 'number') {
      return res.status(400).json({ message: 'City and valid salary are required.' });
    }

    const costData = await CityCost.findOne({ city });
    if (!costData) {
      return res.status(404).json({ message: 'City data not found' });
    }

    // Calculations
    const monthlySalary = salary / 12;
    const estimatedMonthlyRent = (costData.rentIndex / 100) * 2000; // Approx
    const estimatedMonthlyLivingCost = (costData.costOfLivingIndex / 100) * 3000; // Approx
    const disposableIncome = monthlySalary - estimatedMonthlyRent - estimatedMonthlyLivingCost;
    const affordability = disposableIncome > 0 ? 'Affordable' : 'Not Affordable';

    // Validate values before sending
    if (
      isNaN(monthlySalary) || isNaN(estimatedMonthlyRent) ||
      isNaN(estimatedMonthlyLivingCost) || isNaN(disposableIncome)
    ) {
      return res.status(500).json({ message: 'Calculation failed due to invalid data' });
    }

    console.log("Sending response with values:", {
        monthlySalary,
        estimatedMonthlyRent,
        estimatedMonthlyLivingCost,
        disposableIncome,
        affordability
        });


    return res.json({
      city: costData.city,
      country: costData.country,
      monthlySalary,
      estimatedMonthlyRent,
      estimatedMonthlyLivingCost,
      disposableIncome,
      affordability
    });

  } catch (err) {
    console.error('Calculation error:', err);
    return res.status(500).json({ message: err.message });
  }
});
