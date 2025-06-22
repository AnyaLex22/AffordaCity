interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: "Salary Input" },
    { number: 2, label: "City Selection" },
    { number: 3, label: "Results" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step.number <= currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step.number <= currentStep
                    ? "text-primary"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
