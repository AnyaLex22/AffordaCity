import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProgressIndicator } from "@/components/calculator/progress-indicator";
import { StepOne } from "@/components/calculator/step-one";
import { StepTwo } from "@/components/calculator/step-two";
import { StepThree } from "@/components/calculator/step-three";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CalculationFormData, CalculationResult } from "@/types/calculation";

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CalculationFormData>({
    salary: "",
    currency: "USD",
    currentCity: "",
    targetCity: "",
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: api.saveCalculation,
    onSuccess: () => {
      toast({
        title: "Calculation saved!",
        description: "Your calculation has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to save calculation:", error);
      toast({
        title: "Error",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const calculationResult = await api.calculateAffordability({
        salary: Number(formData.salary),
        currency: formData.currency,
        currentCity: formData.currentCity,
        targetCity: formData.targetCity,
      });
      setResult(calculationResult);
      setCurrentStep(3);
    } catch (error) {
      console.error("Calculation failed:", error);
      toast({
        title: "Calculation failed",
        description: "Unable to calculate affordability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = () => {
    if (result) {
      saveMutation.mutate(result);
    }
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setFormData({
      salary: "",
      currency: "USD",
      currentCity: "",
      targetCity: "",
    });
    setResult(null);
  };

  const handleCompareMore = () => {
    setCurrentStep(2);
    setFormData(prev => ({ ...prev, targetCity: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your Affordability</h1>
            <p className="text-lg text-gray-600">Follow these simple steps to see if you can afford your target city</p>
          </div>

          <ProgressIndicator currentStep={currentStep} />

          {currentStep === 1 && (
            <StepOne
              formData={formData}
              setFormData={setFormData}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepTwo
              formData={formData}
              setFormData={setFormData}
              onNext={handleCalculate}
              onPrevious={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && result && (
            <StepThree
              result={result}
              onSave={handleSave}
              onStartNew={handleStartNew}
              onCompareMore={handleCompareMore}
            />
          )}

          {isCalculating && (
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span className="text-gray-700">Calculating affordability...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
