import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database...');

    // Clear existing data
    await prisma.employee.deleteMany({});

    // Create completed application
    await prisma.employee.create({
      data: {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "555-0100",
        dateOfBirth: new Date("1990-01-15"),
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
  
        emergencyContactName: "Jane Doe",
        emergencyContactPhone: "555-0101",
        emergencyContactRelation: "Spouse",
  
        startDate: new Date("2025-04-15"),
        department: "Engineering",
        position: "Senior Developer",
  
        bankName: "First National Bank",
        accountNumber: "****1234",
        routingNumber: "****5678",
  
        ssn: "***-**-1234",
        w4Status: "single",
        dependents: 0,
  
        currentStep: 9,
        isComplete: true,
      },
    });
  
    // Create partial application
    await prisma.employee.create({
      data: {
        email: "sarah.smith@example.com",
        firstName: "Sarah",
        lastName: "Smith",
        phoneNumber: "555-0102",
        dateOfBirth: new Date("1988-06-20"),
        address: "456 Oak Ave",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
  
        emergencyContactName: "Michael Smith",
        emergencyContactPhone: "555-0103",
        emergencyContactRelation: "Brother",
  
        currentStep: 4,
        isComplete: false,
      },
    });
  
    // Create application just started
    await prisma.employee.create({
      data: {
        email: "alex.wilson@example.com",
        firstName: "Alex",
        lastName: "Wilson",
        phoneNumber: "555-0104",
        currentStep: 2,
        isComplete: false,
      },
    });
  
  console.log('Seed data created successfully');

  console.log('Database initialized successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });