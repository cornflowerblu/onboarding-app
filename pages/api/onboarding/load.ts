import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      return res.status(404).json({ exists: false });
    }

    // Transform the database record into the application state format
    const applicationState = {
      currentStep: employee.currentStep,
      isComplete: employee.isComplete,
      personalInfo: {
        email: employee.email,
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phoneNumber: employee.phoneNumber || '',
        dateOfBirth: employee.dateOfBirth?.toISOString().split('T')[0] || '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        zipCode: employee.zipCode || '',
      },
      emergencyContact: {
        name: employee.emergencyContactName || '',
        phone: employee.emergencyContactPhone || '',
        relation: employee.emergencyContactRelation || '',
      },
      employmentDetails: {
        startDate: employee.startDate?.toISOString().split('T')[0] || '',
        department: employee.department || '',
        position: employee.position || '',
      },
      bankingInfo: {
        bankName: employee.bankName || '',
        accountNumber: employee.accountNumber || '',
        routingNumber: employee.routingNumber || '',
      },
      taxInfo: {
        ssn: employee.ssn || '',
        w4Status: employee.w4Status || '',
        dependents: employee.dependents || 0,
      },
      documents: {
        idDocument: null,
        w4Document: null,
      },
    };

    return res.status(200).json({
      exists: true,
      application: applicationState,
    });
  } catch (error) {
    console.error('Error loading onboarding data:', error);
    return res.status(500).json({ message: 'Error loading onboarding data' });
  }
}