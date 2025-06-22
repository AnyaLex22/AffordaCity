import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, Home, Utensils, Car, Gamepad2, ShoppingBag, Save, Plus, RefreshCw, ArrowDown } from "lucide-react";
import type { CalculationResult } from "@/types/calculation";

interface StepThreeProps {
  result: CalculationResult;
  onSave: () => void;
  onStartNew: () => void;
  onCompareMore: () => void;
}

export function StepThree({ result, onSave, onStartNew, onCompareMore }: StepThreeProps) {
  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAffordabilityIcon = (score: number) => {
    if (score >= 60) return <ThumbsUp className="text-emerald-600 text-3xl" />;
    return <ThumbsUp className="text-red-600 text-3xl rotate-180" />;
  };

  const getAffordabilityMessage = (score: number) => {
    if (score >= 80) return "Yes! You can afford";
    if (score >= 60) return "You can moderately afford";
    return "It might be challenging to afford";
  };

  const surplusPercentage = (result.surplus / result.monthlyIncome) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with overall verdict */}
      <Card className="shadow-lg mb-8">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
              {getAffordabilityIcon(result.affordabilityScore)}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getAffordabilityMessage(result.affordabilityScore)} <span className="text-primary">{result.targetCity}</span>
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Based on your salary of <span className="font-semibold">${result.salary.toLocaleString()}</span>, 
            {result.affordabilityScore >= 60 ? " you'll have a comfortable lifestyle" : " it may be tight financially"}
          </p>
          <Badge className={`${result.affordabilityScore >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            Affordability Score: {result.affordabilityScore}/100
          </Badge>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Budget Breakdown */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Budget Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Home className="text-blue-500 w-5 h-5" />
                  <span className="ml-3 text-gray-700">Housing (Rent + Utils)</span>
                </div>
                <span className="font-semibold text-gray-900">${result.housingCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Utensils className="text-green-500 w-5 h-5" />
                  <span className="ml-3 text-gray-700">Food & Dining</span>
                </div>
                <span className="font-semibold text-gray-900">${result.foodCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Car className="text-purple-500 w-5 h-5" />
                  <span className="ml-3 text-gray-700">Transportation</span>
                </div>
                <span className="font-semibold text-gray-900">${result.transportCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Gamepad2 className="text-orange-500 w-5 h-5" />
                  <span className="ml-3 text-gray-700">Entertainment</span>
                </div>
                <span className="font-semibold text-gray-900">${result.entertainmentCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <ShoppingBag className="text-pink-500 w-5 h-5" />
                  <span className="ml-3 text-gray-700">Other Expenses</span>
                </div>
                <span className="font-semibold text-gray-900">${result.otherCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 pt-6 border-t-2 border-gray-200">
                <span className="font-bold text-gray-900">Total Monthly Expenses</span>
                <span className="font-bold text-xl text-red-600">${result.totalCost.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income vs Expenses */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Income vs Expenses</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Income (After Tax)</span>
                  <span className="text-sm font-bold text-emerald-600">${Math.round(result.monthlyIncome).toLocaleString()}</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Expenses</span>
                  <span className="text-sm font-bold text-red-500">${result.totalCost.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(result.totalCost / result.monthlyIncome) * 100} 
                  className="h-3"
                />
              </div>
              
              <div className={`p-4 rounded-lg ${result.surplus > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${result.surplus > 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                    Monthly {result.surplus > 0 ? 'Surplus' : 'Deficit'}
                  </span>
                  <span className={`font-bold text-2xl ${result.surplus > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${Math.abs(result.surplus).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${result.surplus > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {Math.abs(surplusPercentage).toFixed(0)}% of your income {result.surplus > 0 ? 'available for savings & discretionary spending' : 'over budget'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison with Current City */}
      <Card className="shadow-lg mb-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Comparison with Your Current City</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">{result.currentCity}</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ${result.totalCost > 3000 ? '4,200' : '2,800'}
              </div>
              <div className="text-sm text-blue-700">Monthly expenses</div>
            </div>
            
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">{result.targetCity}</h4>
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                ${result.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-emerald-700">Monthly expenses</div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <div className="inline-flex items-center bg-emerald-100 px-6 py-3 rounded-full">
              <ArrowDown className="text-emerald-600 mr-2 h-4 w-4" />
              <span className="font-semibold text-emerald-800">
                Moving could save you money!
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={onSave}
        >
          <Save className="mr-2 h-4 w-4" /> Save This Calculation
        </Button>
        <Button 
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5"
          onClick={onCompareMore}
        >
          <Plus className="mr-2 h-4 w-4" /> Compare More Cities
        </Button>
        <Button 
          variant="outline"
          onClick={onStartNew}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Start New Calculation
        </Button>
      </div>
    </div>
  );
}
