import { Formik, Form } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';
import { personalInfoSchema } from '../../utils/validationSchemas';
import FormField from '../FormField';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function PersonalInfoStep() {
  const { state, updateStepData, updateStep, loadExistingApplication } = useOnboarding();
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleEmailBlur = async (email: string) => {
    if (!email) return;

    setCheckingEmail(true);
    const exists = await loadExistingApplication(email);
    if (exists) {
      setShowExistingModal(true);
    }
    setCheckingEmail(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

      <Formik
        initialValues={state.personalInfo}
        validationSchema={personalInfoSchema}
        onSubmit={async (values) => {
          await updateStepData('personalInfo', values);
          updateStep(3);
        }}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              label="Email"
              name="email"
              type="email"
              onBlur={() => handleEmailBlur(values.email)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" name="firstName" />
              <FormField label="Last Name" name="lastName" />
            </div>
            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
            />
            <FormField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
            />
            <FormField label="Address" name="address" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="City" name="city" />
              <FormField label="State" name="state" />
              <FormField label="ZIP Code" name="zipCode" />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <Dialog
        open={showExistingModal}
        onClose={() => setShowExistingModal(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md mx-auto">
            <Dialog.Title className="text-lg font-medium">
              Existing Application Found
            </Dialog.Title>
            <Dialog.Description className="mt-2">
              We found an existing application for this email. Would you like to continue where you left off?
            </Dialog.Description>

            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setShowExistingModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Start Fresh
              </button>
              <button
                onClick={() => {
                  setShowExistingModal(false);
                  // The application is already loaded by handleEmailBlur
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Continue Application
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}