export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface OnboardingState {
  currentStep: OnboardingStep;
  personalInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  employmentDetails: {
    startDate: string;
    department: string;
    position: string;
  };
  bankingInfo: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  taxInfo: {
    ssn: string;
    w4Status: string;
    dependents: number;
  };
  documents: {
    idDocument: File | null;
    w4Document: File | null;
  };
}