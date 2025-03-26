import { useOnboarding } from '../context/OnboardingContext';

const steps = [
  { id: 1, name: 'Welcome' },
  { id: 2, name: 'Personal Info' },
  { id: 3, name: 'Emergency Contact' },
  { id: 4, name: 'Employment' },
  { id: 5, name: 'Banking' },
  { id: 6, name: 'Tax Info' },
  { id: 7, name: 'Documents' },
  { id: 8, name: 'Review' },
  { id: 9, name: 'Complete' },
];

export default function StepIndicator() {
  const { state } = useOnboarding();
  const currentStep = state.currentStep;

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step) => (
          <li key={step.id} className="md:flex-1">
            <div
              className={`flex flex-col border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                step.id < currentStep
                  ? 'border-indigo-600'
                  : step.id === currentStep
                  ? 'border-indigo-600'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  step.id < currentStep
                    ? 'text-indigo-600'
                    : step.id === currentStep
                    ? 'text-indigo-600'
                    : 'text-gray-500'
                }`}
              >
                Step {step.id}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}