import * as Yup from 'yup';

const phoneRegExp = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
const ssnRegExp = /^\d{3}-?\d{2}-?\d{4}$/;
const routingRegExp = /^\d{9}$/;
const accountRegExp = /^\d{4,17}$/;

export const personalInfoSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'Too short'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Too short'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Invalid phone number')
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Date of birth is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .required('ZIP code is required'),
});

export const emergencyContactSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Invalid phone number')
    .required('Phone number is required'),
  relation: Yup.string().required('Relation is required'),
});

export const employmentDetailsSchema = Yup.object({
  startDate: Yup.date()
    .required('Start date is required'),
  department: Yup.string().required('Department is required'),
  position: Yup.string().required('Position is required'),
});

export const bankingInfoSchema = Yup.object({
  bankName: Yup.string().required('Bank name is required'),
  routingNumber: Yup.string()
    .matches(routingRegExp, 'Invalid routing number')
    .required('Routing number is required'),
  accountNumber: Yup.string()
    .matches(accountRegExp, 'Invalid account number')
    .required('Account number is required'),
});

export const taxInfoSchema = Yup.object({
  ssn: Yup.string()
    .matches(ssnRegExp, 'Invalid SSN')
    .required('SSN is required'),
  w4Status: Yup.string().required('Filing status is required'),
  dependents: Yup.number()
    .min(0, 'Cannot be negative')
    .required('Number of dependents is required'),
});