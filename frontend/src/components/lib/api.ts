import { apiRequest } from "./queryClient";

export interface CitySearchResult {
  name: string;
  costLevel: string;
}

export interface CostOfLivingData {
  housing: number;
  food: number;
  transport: number;
  entertainment: number;
  other: number;
  currency: string;
}

export interface CalculationFormData {
  salary: number;
  currency: string;
  currentCity: string;
  targetCity: string;
}

export interface CalculationResult extends CalculationFormData {
  housingCost: number;
  foodCost: number;
  transportCost: number;
  entertainmentCost: number;
  otherCost: number;
  totalCost: number;
  monthlyIncome: number;
  surplus: number;
  affordabilityScore: number;
}

export const api = {
  searchCities: async (query: string): Promise<CitySearchResult[]> => {
    const response = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search cities');
    return response.json();
  },

  getCostOfLiving: async (city: string): Promise<CostOfLivingData> => {
    const response = await fetch(`/api/cost-of-living/${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Failed to get cost of living data');
    return response.json();
  },

  calculateAffordability: async (formData: CalculationFormData): Promise<CalculationResult> => {
    // Get cost of living data for the target city
    const costData = await api.getCostOfLiving(formData.targetCity);
    
    // Calculate affordability
    const monthlyIncome = (formData.salary / 12) * 0.75; // After tax estimation
    const totalCost = costData.housing + costData.food + costData.transport + costData.entertainment + costData.other;
    const surplus = monthlyIncome - totalCost;
    const affordabilityScore = Math.min(100, Math.max(0, Math.round((surplus / monthlyIncome) * 100 + 60)));
    
    return {
      ...formData,
      housingCost: costData.housing,
      foodCost: costData.food,
      transportCost: costData.transport,
      entertainmentCost: costData.entertainment,
      otherCost: costData.other,
      totalCost,
      monthlyIncome,
      surplus,
      affordabilityScore,
    };
  },

  saveCalculation: async (calculation: CalculationResult) => {
    const response = await apiRequest('POST', '/api/calculations', calculation);
    return response.json();
  },

  getCalculations: async () => {
    const response = await fetch('/api/calculations');
    if (!response.ok) throw new Error('Failed to get calculations');
    return response.json();
  },

  deleteCalculation: async (id: number) => {
    await apiRequest('DELETE', `/api/calculations/${id}`);
  },

  updateCalculation: async (id: number, calculation: Partial<CalculationResult>) => {
    const response = await apiRequest('PUT', `/api/calculations/${id}`, calculation);
    return response.json();
  },
};
