import { Formik, Form, Field } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';
import { taxInfoSchema } from '../../utils/validationSchemas';
import FormField from '../FormField';

export default function TaxInfoStep() {
  const { state, updateStepData, updateStep } = useOnboarding();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tax Information</h2>
      <p className="text-gray-600 mb-6">
        This information will be used for tax withholding purposes.
      </p>

      <Formik
        initialValues={state.taxInfo}
        validationSchema={taxInfoSchema}
        onSubmit={async (values) => {
          await updateStepData('taxInfo', values);
          updateStep(7);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              label="Social Security Number"
              name="ssn"
              placeholder="XXX-XX-XXXX"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                W-4 Filing Status
              </label>
              <Field
                as="select"
                name="w4Status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select filing status</option>
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="marriedSeparate">Married Filing Separately</option>
                <option value="headOfHousehold">Head of Household</option>
              </Field>
            </div>

            <FormField
              label="Number of Dependents"
              name="dependents"
              type="number"
              min="0"
            />

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(5)}
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