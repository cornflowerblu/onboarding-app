import { Field, ErrorMessage } from 'formik';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

export default function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  className = ''
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Field
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500
 sm:text-sm ${className}`}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="mt-1 text-sm text-red-600"
      />
    </div>
  );
}