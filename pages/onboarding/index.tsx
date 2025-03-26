import { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import WelcomeStep from '../../components/steps/WelcomeStep';
import PersonalInfoStep from '../../components/steps/PersonalInfoStep';
import EmergencyContactStep from '../../components/steps/EmergencyContactStep';
import EmploymentDetailsStep from '../../components/steps/EmploymentDetailsStep';
import BankingInfoStep from '../../components/steps/BankingInfoStep';
import TaxInfoStep from '../../components/steps/TaxInfoStep';
import DocumentsStep from '../../components/steps/DocumentsStep';
import ReviewStep from '../../components/steps/ReviewStep';
import CompleteStep from '../../components/steps/CompleteStep';

export default function OnboardingPage() {
    const { state } = useOnboarding();
    const [isClient, setIsClient] = useState(false);
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    const renderStep = () => {
      switch (state.currentStep) {
        case 1:
          return <WelcomeStep />;
        case 2:
          return <PersonalInfoStep />;
        case 3:
          return <EmergencyContactStep />;
        case 4:
          return <EmploymentDetailsStep />;
        case 5:
          return <BankingInfoStep />;
        case 6:
          return <TaxInfoStep />;
        case 7:
          return <DocumentsStep />;
        case 8:
          return <ReviewStep />;
        case 9:
          return <CompleteStep />;
        default:
          return <WelcomeStep />;
      }
    };
  
    if (!isClient) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
  
    return <OnboardingLayout>{renderStep()}</OnboardingLayout>;
  }