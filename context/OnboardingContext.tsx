"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { OnboardingState, OnboardingStep } from '../types/onboarding';

interface OnboardingContextType {
  state: OnboardingState;
  updateStep: (step: OnboardingStep) => void;
  updateStepData: (stepName: keyof OnboardingState, data: any) => void;
  loadExistingApplication: (email: string) => Promise<boolean>;
}

const defaultState: OnboardingState = {
  currentStep: 1,
  personalInfo: {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  emergencyContact: {
    name: '',
    phone: '',
    relation: '',
  },
  employmentDetails: {
    startDate: '',
    department: '',
    position: '',
  },
  bankingInfo: {
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  },
  taxInfo: {
    ssn: '',
    w4Status: '',
    dependents: 0,
  },
  documents: {
    idDocument: null,
    w4Document: null,
  },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem('onboardingState');
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  const updateStep = (step: OnboardingStep) => {
    setState((prev: any) => {
      const newState = { ...prev, currentStep: step };
      localStorage.setItem('onboardingState', JSON.stringify(newState));
      return newState;
    });
  };

  const updateStepData = async (stepName: keyof OnboardingState, data: any) => {
    setState((prev: any) => {
      const newState = { ...prev, [stepName]: data };
      localStorage.setItem('onboardingState', JSON.stringify(newState));
      return newState;
    });

    // Save to database
    try {
      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepName, data }),
      });
    } catch (error) {
      console.error('Failed to save step data:', error);
    }
  };

  const loadExistingApplication = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/onboarding/load?email=${email}`);
      const data = await response.json();

      if (data.exists) {
        setState(data.application);
        localStorage.setItem('onboardingState', JSON.stringify(data.application));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load application:', error);
      return false;
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <OnboardingContext.Provider value={{ state, updateStep, updateStepData, loadExistingApplication }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;