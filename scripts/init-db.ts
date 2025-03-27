import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample employees
  const employees = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '555-123-4567',
      department: 'Engineering',
      position: 'Software Engineer',
      currentStep: 3,
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '555-987-6543',
      department: 'Marketing',
      position: 'Marketing Manager',
      currentStep: 2,
    },
    {
      email: 'robert.johnson@example.com',
      firstName: 'Robert',
      lastName: 'Johnson',
      phoneNumber: '555-456-7890',
      department: 'Finance',
      position: 'Financial Analyst',
      currentStep: 1,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: employee,
      create: employee,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
