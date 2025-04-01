import { Formik, Form } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';
import { emergencyContactSchema } from '../../utils/validationSchemas';
import FormField from '../FormField';

export default function EmergencyContactStep() {
  const { state, updateStepData, updateStep, saveApplication } = useOnboarding();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Emergency Contact</h2>

      <Formik
        initialValues={state.emergencyContact}
        validationSchema={emergencyContactSchema}
        onSubmit={(values) => {
          console.log('Updating Step Data')
          updateStepData('emergencyContact', values);
          updateStep(4);
          saveApplication({
            ...state,
            currentStep: 4
          });
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              label="Full Name"
              name="name"
              placeholder="Full name of emergency contact"
            />

            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="Phone number"
            />

            <FormField
              label="Relationship"
              name="relation"
              placeholder="e.g., Spouse, Parent, Friend"
            />

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(2)}
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
    </div>
  );
}