import { useState } from 'react';
import { Formik, Form } from 'formik';
import { useOnboarding } from '../../context/OnboardingContext';

export default function DocumentsStep() {
  const { state, updateStepData, updateStep, saveApplication } = useOnboarding();
  const [idFileName, setIdFileName] = useState('');
  const [w4FileName, setW4FileName] = useState('');

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Required Documents</h2>
      <p className="text-gray-600 mb-6">
        Please upload the following required documents. Accepted formats: PDF, JPG, PNG.
      </p>

      <Formik
        initialValues={{
          idDocument: null,
          w4Document: null,
        }}
        onSubmit={(values, {setSubmitting}) => {          
          try {
            updateStepData('documents', {
              idDocument: idFileName,
              w4Document: w4FileName,
            });
            updateStep(8);
            saveApplication({
              ...state,
              currentStep: 8
            });
          } catch (error) {
            console.error('Error saving application:', error)
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government-issued ID (Driver's License, Passport, etc.)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFieldValue('idDocument', file);
                      setIdFileName(file.name);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {idFileName && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {idFileName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed W-4 Form
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFieldValue('w4Document', file);
                      setW4FileName(file.name);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {w4FileName && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {w4FileName}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => updateStep(6)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!idFileName && !w4FileName)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
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