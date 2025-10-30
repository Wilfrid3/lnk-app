import React from 'react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      {/* Mobile view: Shows current step / total steps */}
      <div className="sm:hidden flex justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Étape {currentStep + 1}/{steps.length}
        </span>
      </div>
      
      {/* Desktop view: Shows all steps with indicator */}
      <div className="hidden sm:flex justify-center w-full mb-4 relative">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Connect lines between circles */}
            {index > 0 && (
              <div 
                className={`flex-1 h-0.5 my-auto ${
                  index <= currentStep ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              ></div>
            )}
            {/* Step circles */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? 'bg-primary-500 text-white' 
                    : index === currentStep 
                      ? 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                }`}
              >
                {index < currentStep ? (
                  <span className="material-icons text-sm">check</span>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-xs ${
                index <= currentStep ? 'text-primary-500 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar for mobile */}
      <div className="sm:hidden w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2 mb-6">
        <div 
          className="bg-primary-500 h-1 rounded-full transition-all duration-300" 
          style={{ width: `${(currentStep + 1) / steps.length * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
