import { Link, useLocation } from "wouter";
import { Calculator, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Calculator className="text-primary text-2xl" />
              <span className="ml-2 text-xl font-bold text-gray-900">AffordCity</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                location === "/" 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Home className="inline mr-1 h-4 w-4" />
              Home
            </Link>
            <Link 
              href="/calculator" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                location === "/calculator" 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Calculator className="inline mr-1 h-4 w-4" />
              Calculator
            </Link>
            <Link 
              href="/my-calculations" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                location === "/my-calculations" 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FileText className="inline mr-1 h-4 w-4" />
              My Calculations
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
