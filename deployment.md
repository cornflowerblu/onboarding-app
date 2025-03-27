# Deployment Instructions

## Development Environment (AWS Amplify)

1. Push your code to a Git repository (GitHub, GitLab, or AWS CodeCommit)
2. Create a new Amplify app in the AWS Console
3. Connect your repository
4. Amplify will automatically detect the Next.js project and use the amplify.yml configuration
5. Add the following environment variables in Amplify Console:
   - DATABASE_URL: Your development database connection string

## Production Environment (ECS with Aurora Serverless)

1. Create an ECR repository:
```bash
aws ecr create-repository --repository-name onboarding-app
```

2. Deploy the CloudFormation stack:
```bash
aws cloudformation create-stack \
  --stack-name onboarding-prod \
  --template-body file://infrastructure/cloudformation.yml \
  --capabilities CAPABILITY_IAM
```

3. Build and push the Docker image:
```bash
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com
docker build -t onboarding-app .
docker tag onboarding-app:latest account.dkr.ecr.region.amazonaws.com/onboarding-app:latest
docker push account.dkr.ecr.region.amazonaws.com/onboarding-app:latest
```

4. Create an ECS service using the AWS Console or CLI pointing to the task definition created by CloudFormation

The Aurora Serverless database will be automatically created and configured. The connection string will be available in the CloudFormation outputs.