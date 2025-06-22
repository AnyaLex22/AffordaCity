import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { CalculationFormData } from "@/types/calculation";

interface StepOneProps {
  formData: CalculationFormData;
  setFormData: (data: CalculationFormData) => void;
  onNext: () => void;
}

export function StepOne({ formData, setFormData, onNext }: StepOneProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.salary || !formData.currentCity) {
      alert("Please fill in all required fields");
      return;
    }
    if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      alert("Please enter a valid salary amount");
      return;
    }
    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          What's Your Current Salary?
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
              Annual Salary
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="salary"
                type="number"
                placeholder="50000"
                className="pl-8 text-lg"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currentCity" className="block text-sm font-medium text-gray-700 mb-2">
                Current City
              </Label>
              <Input
                id="currentCity"
                type="text"
                placeholder="New York"
                value={formData.currentCity}
                onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90">
            Continue to City Selection <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
