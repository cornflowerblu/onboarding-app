import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/solid';

export default function CompleteStep() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500" />
      </div>

      <h2 className="text-3xl font-bold mb-6">Onboarding Complete!</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <p className="text-lg mb-4">
          Thank you for completing your onboarding process. Your information has been submitted successfully.
        </p>

        <p className="mb-4">
          What happens next:
        </p>

        <ul className="list-disc text-left pl-8 mb-6">
          <li className="mb-2">Our HR team will review your information</li>
          <li className="mb-2">You'll receive a confirmation email within 24 hours</li>
          <li className="mb-2">Any additional steps will be communicated via email</li>
          <li className="mb-2">Be ready for your first day on the date you provided</li>
        </ul>

        <p className="mb-6">
          If you have any questions, please contact HR at hr@company.com.
        </p>
      </div>

      <Link href="/">
        <a className="inline-block px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Return to Home
        </a>
      </Link>
    </div>
  );
}