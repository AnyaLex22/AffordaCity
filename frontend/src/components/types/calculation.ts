export interface CalculationFormData {
  salary: string;
  currency: string;
  currentCity: string;
  targetCity: string;
}

export interface CalculationResult {
  id?: number;
  salary: number;
  currency: string;
  currentCity: string;
  targetCity: string;
  housingCost: number;
  foodCost: number;
  transportCost: number;
  entertainmentCost: number;
  otherCost: number;
  totalCost: number;
  monthlyIncome: number;
  surplus: number;
  affordabilityScore: number;
  createdAt?: string;
}

export interface CityOption {
  name: string;
  costLevel: string;
}
