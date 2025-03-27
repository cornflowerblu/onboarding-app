import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { step, data, identifier } = req.body;

    if (step === 'personalInfo' && !identifier?.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Flatten the nested structure
    const flattenedData = {
      // Personal Info
      email: data.personalInfo?.email,
      firstName: data.personalInfo?.firstName,
      lastName: data.personalInfo?.lastName,
      phoneNumber: data.personalInfo?.phoneNumber,
      dateOfBirth: data.personalInfo?.dateOfBirth,
      address: data.personalInfo?.address,
      city: data.personalInfo?.city,
      state: data.personalInfo?.state,
      zipCode: data.personalInfo?.zipCode,

      // Emergency Contact
      emergencyContactName: data.emergencyContact?.name,
      emergencyContactPhone: data.emergencyContact?.phone,
      emergencyContactRelation: data.emergencyContact?.relation,

      // Employment Details
      startDate: data.employmentDetails?.startDate || new Date().toISOString(),
      department: data.employmentDetails?.department,
      position: data.employmentDetails?.position,

      // Banking Info
      bankName: data.bankingInfo?.bankName,
      accountNumber: data.bankingInfo?.accountNumber,
      routingNumber: data.bankingInfo?.routingNumber,

      // Tax Info
      ssn: data.taxInfo?.ssn,
      w4Status: data.taxInfo?.w4Status,
      dependents: data.taxInfo?.dependents,

      // Documents
      idDocumentUrl: data.documents?.idDocument,
      w4DocumentUrl: data.documents?.w4Document,

      // Meta fields
      currentStep: step === 'complete' ? 9 : undefined,
      isComplete: step === 'complete' ? true : undefined,
    };

    const employee = await prisma.employee.upsert({
      where: {
        email: identifier.email,
      },
      update: flattenedData,
      create: {
        ...flattenedData,
        email: identifier.email,
        currentStep: 2,
      },
    });

    return res.status(200).json(employee);
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return res.status(500).json({ message: 'Error saving onboarding data' });
  }
}
