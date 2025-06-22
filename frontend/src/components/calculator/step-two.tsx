import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Search, Calculator } from "lucide-react";
import { api } from "@/lib/api";
import type { CalculationFormData, CityOption } from "@/types/calculation";

interface StepTwoProps {
  formData: CalculationFormData;
  setFormData: (data: CalculationFormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StepTwo({ formData, setFormData, onNext, onPrevious }: StepTwoProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const popularCities: CityOption[] = [
    { name: "London, UK", costLevel: "High cost" },
    { name: "Tokyo, Japan", costLevel: "Very high cost" },
    { name: "Berlin, Germany", costLevel: "Moderate cost" },
    { name: "Bangkok, Thailand", costLevel: "Low cost" },
    { name: "Sydney, Australia", costLevel: "High cost" },
    { name: "Mexico City, Mexico", costLevel: "Low cost" },
  ];

  useEffect(() => {
    const searchCities = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await api.searchCities(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to search cities:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchCities, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const selectCity = (cityName: string) => {
    setFormData({ ...formData, targetCity: cityName });
  };

  const handleNext = () => {
    if (!formData.targetCity) {
      alert("Please select a city to compare");
      return;
    }
    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Where Do You Want to Move?
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="citySearch" className="block text-sm font-medium text-gray-700 mb-2">
              Search Cities
            </Label>
            <div className="relative">
              <Input
                id="citySearch"
                type="text"
                placeholder="Type to search cities..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Search Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((city) => (
                  <Button
                    key={city.name}
                    variant="outline"
                    className={`p-3 text-left justify-start h-auto ${
                      formData.targetCity === city.name
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary hover:bg-primary/5"
                    }`}
                    onClick={() => selectCity(city.name)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.costLevel}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Cities */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Destinations</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularCities.map((city) => (
                <Button
                  key={city.name}
                  variant="outline"
                  className={`p-3 text-left justify-start h-auto ${
                    formData.targetCity === city.name
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => selectCity(city.name)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.costLevel}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleNext}
          >
            Calculate Affordability <Calculator className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
