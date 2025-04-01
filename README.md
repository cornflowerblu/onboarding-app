# Employee Onboarding Application

A modern employee onboarding application built with Next.js, Prisma, and PostgreSQL. This application streamlines the employee onboarding process by guiding new hires through a step-by-step workflow to collect necessary information and documentation.

## Features

- **Multi-step onboarding process** with progress tracking
- **Form validation** using Formik and Yup
- **Responsive design** with Tailwind CSS
- **Database integration** with PostgreSQL via Prisma ORM
- **Deployment options** for AWS Amplify with Aurora Serverless

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Forms**: Formik, Yup, React DatePicker
- **UI Components**: Headless UI, Heroicons
- **Database**: PostgreSQL with Prisma ORM
- **Development**: TypeScript, ESLint, TurboRepo

## State Management

The application implements a sophisticated state management system that enhances user experience during the onboarding process. As users progress through each step, form data is temporarily saved client-side, allowing them to navigate between steps without losing information. When a user completes a step and proceeds to the next one, the entire application state is persisted to the database. This approach provides a seamless experience while ensuring data integrity and allowing users to resume their onboarding process at any time.

## Development History

This project was scaffolded and approximately 90% of the code was generated using the Amazon Q Developer CLI. The remaining 10% was written by one senior developer who focused on bug fixes, UX improvements, and refining the state management system's mechanisms. This development approach significantly accelerated the creation process while maintaining high code quality and best practices.

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- PostgreSQL database (local or remote)

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/onboarding_db"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Initialize database with seed data (optional)
npm run init-db
```

### Development Server

```bash
# Start the development server with Turbopack
npm run dev

# For debugging
npm run debug
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Application Structure

- `/app` - Next.js application routes and pages
- `/components` - React components
  - `/steps` - Individual onboarding step components
- `/context` - React context providers
- `/hooks` - Custom React hooks
- `/prisma` - Prisma schema and migrations
- `/public` - Static assets
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

## Onboarding Process

The application guides employees through the following steps:

1. **Welcome** - Introduction to the onboarding process
2. **Personal Information** - Basic personal details
3. **Emergency Contact** - Emergency contact information
4. **Employment Details** - Position, department, start date
5. **Banking Information** - Direct deposit details
6. **Tax Information** - W-4 and tax withholding information
7. **Documents** - Upload identification and tax documents
8. **Review** - Review all submitted information
9. **Complete** - Confirmation of completed onboarding

## Database Schema

The application uses a PostgreSQL database with the following main entity:

- **Employee** - Stores all employee information including personal details, emergency contacts, employment information, banking details, and document references

## Deployment

### Local Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### AWS Deployment

The application can be deployed to AWS using Amplify with Aurora Serverless PostgreSQL. Deployment mechanisms are still under development.

For current deployment instructions, refer to [README-AMPLIFY-RDS.md](./README-AMPLIFY-RDS.md).

### Production Environment

For production deployment, create a `prod.env` file based on the `prod.env.template`:

1. Copy `prod.env.template` to `prod.env`
2. Replace the placeholder values with your actual database credentials

## Development Tools

- **Prisma Studio**: View and edit database records
  ```bash
  npm run prisma:studio
  ```

- **Linting**: Check code quality
  ```bash
  npm run lint
  ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
