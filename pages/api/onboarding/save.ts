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
    const { step, data } = req.body;

    // Ensure email exists in the request for personal info
    if (step === 'personalInfo' && !data.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const employee = await prisma.employee.upsert({
      where: {
        email: data.email || '',
      },
      update: {
        ...data,
        currentStep: step === 'complete' ? 9 : undefined,
        isComplete: step === 'complete' ? true : undefined,
      },
      create: {
        ...data,
        currentStep: 2,
      },
    });

    return res.status(200).json(employee);
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return res.status(500).json({ message: 'Error saving onboarding data' });
  }
}