import { Formik, Form } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';
import { bankingInfoSchema } from '../../utils/validationSchemas';
import FormField from '../FormField';

export default function BankingInfoStep() {
  const { state, updateStepData, updateStep, saveApplication } = useOnboarding();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Banking Information</h2>
      <p className="text-gray-600 mb-6">
        This information will be used for direct deposit of your paycheck.
      </p>

      <Formik
        initialValues={state.bankingInfo}
        validationSchema={bankingInfoSchema}
        onSubmit={(values, {setSubmitting}) => {
          try {
            updateStepData('bankingInfo', values);          
            updateStep(6);
            saveApplication({
              ...state,
              currentStep: 6
            });            
          } catch (error) {
            console.error('Error saving banking info:', error);
          } finally {
            setSubmitting(false)
          }

        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              label="Bank Name"
              name="bankName"
              placeholder="Name of your bank"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Routing Number"
                name="routingNumber"
                placeholder="9-digit routing number"
              />

              <FormField
                label="Account Number"
                name="accountNumber"
                placeholder="Your account number"
              />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(4)}
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