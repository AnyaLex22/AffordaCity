import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const scrollToCalculator = () => {
    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Can You <span className="text-primary">Afford</span> Your Dream City?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compare your salary with real cost of living data from around the world. Make informed decisions about where to live, work, and thrive.
            </p>
            <Link href="/calculator">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                Start Calculating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">2,500+</div>
              <div className="text-gray-600 mt-2">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="text-gray-600 mt-2">Calculations Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">95%</div>
              <div className="text-gray-600 mt-2">Data Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            It only takes a few minutes to see if you can afford your dream city.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Use Calculator Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
