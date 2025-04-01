import { Formik, Form } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';
import { employmentDetailsSchema } from '../../utils/validationSchemas';
import FormField from '../FormField';
import { OnboardingState } from '@/types/onboarding';

export default function EmploymentDetailsStep() {
  const { state, updateStepData, updateStep, saveApplication } = useOnboarding();

  const handleBlur = (values: any) => {
    updateStepData('employmentDetails', values)
  }

  const formatInitialValues = (state: OnboardingState) => {
    if (!state.personalInfo?.dateOfBirth) {
      console.log(state.personalInfo)
      return state.employmentDetails;
    }

  const formattedDate = new Date(state.employmentDetails.startDate)
    .toISOString()
    .split('T')[0];  // This will give us just the date part

  return {
    ...state.employmentDetails,
    startDate: formattedDate
  };
};

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Employment Details</h2>

      <Formik
        initialValues={formatInitialValues(state)}
        validationSchema={employmentDetailsSchema}
        onSubmit={async (values) => {
          const formattedValues = {
            ...values,
            startDate: values.startDate ? new Date(values.startDate).toISOString() : new Date().toISOString()
          };
          updateStepData('employmentDetails', formattedValues);
          updateStep(5);
          saveApplication({
            ...state,
            employmentDetails: formattedValues,
            currentStep: 5
          });
        }}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-4"
          onBlur={() => {
            const date = new Date(values.startDate).toISOString() || null;
            handleBlur({ ...values, startDate: date })
          }}
          >
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
            />

            <FormField
              label="Department"
              name="department"
              placeholder="e.g., Engineering, Marketing, HR"
            />

            <FormField
              label="Position"
              name="position"
              placeholder="Your job title"
            />

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(3)}
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