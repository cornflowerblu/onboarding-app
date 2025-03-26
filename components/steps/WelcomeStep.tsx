import { useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

export default function WelcomeStep() {
  const { updateStep } = useOnboarding();

  // Use useEffect to prevent double-click issues
  useEffect(() => {
    // This would be a good place to initialize any welcome step specific logic
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Onboarding Process</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <p className="text-lg mb-4">
          We're excited to have you join our team! This onboarding process will guide you through providing all the necessary information before your first day.
        </p>

        <p className="mb-4">
          You'll need to complete the following steps:
        </p>

        <ul className="list-disc text-left pl-8 mb-6">
          <li className="mb-2">Personal Information</li>
          <li className="mb-2">Emergency Contact</li>
          <li className="mb-2">Employment Details</li>
          <li className="mb-2">Banking Information for Direct Deposit</li>
          <li className="mb-2">Tax Information</li>
          <li className="mb-2">Required Documents</li>
        </ul>

        <p className="mb-6">
          You can save your progress at any time and return later to complete the process.
        </p>
      </div>

      <button
        onClick={() => updateStep(2)}
        className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Begin Onboarding
      </button>
    </div>
  );
}