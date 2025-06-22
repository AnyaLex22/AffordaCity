import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CalculationCard } from "@/components/saved-calculations/calculation-card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CalculationResult } from "@/types/calculation";

export default function MyCalculations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: calculations = [], isLoading } = useQuery({
    queryKey: ["/api/calculations"],
    queryFn: api.getCalculations,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCalculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      toast({
        title: "Calculation deleted",
        description: "Your calculation has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete calculation:", error);
      toast({
        title: "Error",
        description: "Failed to delete calculation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number) => {
    // In a real app, this would navigate to an edit form
    toast({
      title: "Edit functionality",
      description: "Edit functionality would be implemented here.",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this calculation?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (id: number) => {
    // In a real app, this would show a detailed view
    toast({
      title: "View details",
      description: "Detailed view would be implemented here.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Calculations</h1>
            <p className="text-lg text-gray-600">Keep track of your city comparisons and affordability analyses</p>
          </div>

          {calculations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No calculations yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first affordability calculation.</p>
              <a
                href="/calculator"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Create First Calculation
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculations.map((calculation: CalculationResult) => (
                <CalculationCard
                  key={calculation.id}
                  calculation={calculation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
