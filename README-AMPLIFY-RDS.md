# Next.js Onboarding App with Amplify and Aurora Serverless

This guide explains how to deploy the Next.js onboarding application with AWS Amplify for the frontend and Aurora Serverless PostgreSQL for the database.

## Architecture Overview

This deployment creates:

1. **Frontend**: AWS Amplify hosting for the Next.js application
2. **Database**: Aurora Serverless PostgreSQL database
3. **Connectivity**: Secure connection between the frontend and database

## Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Node.js and npm installed
- Git installed and configured
- GitHub account with a personal access token (with repo scope)

## Deployment Steps

Run the all-in-one deployment script:

```bash
./deploy-amplify-with-rds.sh
```

The script will:

1. Create an Aurora Serverless PostgreSQL database
2. Run Prisma migrations and seed the database
3. Deploy the frontend to AWS Amplify
4. Configure the necessary environment variables

## What Happens During Deployment

### Database Setup

1. Creates a CloudFormation stack with:
   - VPC with public and private subnets
   - Aurora Serverless PostgreSQL cluster
   - Security groups and subnet groups
   - Secrets Manager secret for database credentials

2. Runs Prisma migrations to create the database schema
3. Seeds the database with initial data

### Frontend Deployment

1. Initializes a Git repository if needed
2. Connects to GitHub and pushes the code
3. Creates an AWS Amplify app connected to the GitHub repository
4. Configures the DATABASE_URL environment variable in Amplify
5. Deploys the application

## Manual Steps Required

During deployment, you'll need to:

1. Provide your GitHub username, repository name, and personal access token
2. Create the Amplify app in the AWS Console when prompted (the script will guide you)

## Accessing Your Application

After deployment completes, the script will provide:

- The URL of your deployed application
- The database connection string

## Troubleshooting

### Database Connection Issues

- Check that the security group allows connections from Amplify
- Verify the DATABASE_URL environment variable is correctly set in Amplify
- Check the Amplify build logs for connection errors

### Amplify Deployment Issues

- Ensure your GitHub token has the correct permissions
- Check that the amplify.yml file is correctly formatted
- Review the Amplify build logs for any errors

## Cleanup

To remove all resources:

1. Delete the Amplify app from the AWS Amplify Console
2. Delete the CloudFormation stack:
   ```bash
   aws cloudformation delete-stack --stack-name onboarding-app-db
   ```

## Security Considerations

- The database is configured to be publicly accessible for simplicity
- In a production environment, consider:
  - Using private subnets for the database
  - Implementing a VPC endpoint for Amplify
  - Adding additional security groups and network ACLs
