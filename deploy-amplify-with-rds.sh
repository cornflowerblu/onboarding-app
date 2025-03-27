#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="onboarding-app"
DB_NAME="onboarding"
DB_USER="pgadmin"
BRANCH="main"
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
  REGION="us-east-1"
fi
STACK_NAME="$APP_NAME-db"

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Deploying $APP_NAME with Amplify + RDS  ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Step 1: Create Aurora Serverless PostgreSQL Database
echo -e "${YELLOW}Step 1: Creating Aurora Serverless v2 PostgreSQL Database...${NC}"

# Check if CloudFormation stack exists
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION 2>/dev/null || echo "false")

if [ "$STACK_EXISTS" == "false" ]; then
  echo -e "${YELLOW}Creating new database stack...${NC}"
  
  # Create a temporary CloudFormation template for the database
  cat > /tmp/db-template.yml << EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Aurora Serverless v2 PostgreSQL Database for Onboarding App'

Parameters:
  DatabaseName:
    Type: String
    Default: $DB_NAME
  DatabaseUser:
    Type: String
    Default: $DB_USER

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub \${AWS::StackName}-VPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs ""]
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub \${AWS::StackName}-PublicSubnet1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs ""]
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub \${AWS::StackName}-PublicSubnet2

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub \${AWS::StackName}-IGW

  VPCGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub \${AWS::StackName}-PublicRouteTable

  PublicRoute:
    Type: AWS::EC2::Route
    DependsOn: VPCGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet1
      RouteTableId: !Ref PublicRouteTable

  PublicSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet2
      RouteTableId: !Ref PublicRouteTable

  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Aurora Serverless database
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          CidrIp: 0.0.0.0/0

  AuroraSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub \${AWS::StackName}-aurora-secret
      GenerateSecretString:
        SecretStringTemplate: !Sub '{"username": "\${DatabaseUser}"}'
        GenerateStringKey: "password"
        PasswordLength: 16
        ExcludeCharacters: '"@/\\'

  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for Aurora Serverless
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  # Using Aurora Serverless v2 instead of v1
  AuroraDBClusterParameterGroup:
    Type: AWS::RDS::DBClusterParameterGroup
    Properties:
      Description: Aurora PostgreSQL Cluster Parameter Group
      Family: aurora-postgresql14
      Parameters:
        client_encoding: 'UTF8'

  AuroraDBParameterGroup:
    Type: AWS::RDS::DBParameterGroup
    Properties:
      Description: Aurora PostgreSQL DB Parameter Group
      Family: aurora-postgresql14
      Parameters:
        shared_preload_libraries: 'auto_explain,pg_stat_statements'

  AuroraCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineVersion: '14.6'
      DatabaseName: !Ref DatabaseName
      MasterUsername: !Ref DatabaseUser
      MasterUserPassword: !Sub '{{resolve:secretsmanager:\${AuroraSecret}:SecretString:password}}'
      DBSubnetGroupName: !Ref DBSubnetGroup
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup
      DBClusterParameterGroupName: !Ref AuroraDBClusterParameterGroup
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5
        MaxCapacity: 2

  AuroraInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: aurora-postgresql
      DBClusterIdentifier: !Ref AuroraCluster
      DBInstanceClass: db.serverless
      DBParameterGroupName: !Ref AuroraDBParameterGroup
      PubliclyAccessible: true

Outputs:
  DatabaseEndpoint:
    Description: Aurora Serverless Endpoint
    Value: !GetAtt AuroraCluster.Endpoint.Address
    Export:
      Name: !Sub \${AWS::StackName}-DatabaseEndpoint
  
  DatabasePort:
    Description: Aurora Serverless Port
    Value: !GetAtt AuroraCluster.Endpoint.Port
    Export:
      Name: !Sub \${AWS::StackName}-DatabasePort
      
  DatabaseName:
    Description: Database Name
    Value: !Ref DatabaseName
    Export:
      Name: !Sub \${AWS::StackName}-DatabaseName
      
  DatabaseUser:
    Description: Database User
    Value: !Ref DatabaseUser
    Export:
      Name: !Sub \${AWS::StackName}-DatabaseUser
      
  DatabaseSecretArn:
    Description: Database Secret ARN
    Value: !Ref AuroraSecret
    Export:
      Name: !Sub \${AWS::StackName}-DatabaseSecretArn
EOF

  # Create the stack
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file:///tmp/db-template.yml \
    --capabilities CAPABILITY_IAM \
    --region $REGION
    
  echo -e "${YELLOW}Waiting for database stack creation to complete...${NC}"
  echo -e "${YELLOW}This may take 10-15 minutes. Please be patient.${NC}"
  aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION
else
  echo -e "${YELLOW}Database stack already exists. Skipping creation.${NC}"
fi

# Get database information
echo -e "${YELLOW}Getting database information...${NC}"
DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" --output text --region $REGION)
DB_PORT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DatabasePort'].OutputValue" --output text --region $REGION)
DB_SECRET_ARN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" --output text --region $REGION)

# Get database password from Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id $DB_SECRET_ARN --query "SecretString" --output text --region $REGION | jq -r '.password')

# Construct the DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/$DB_NAME"

echo -e "${GREEN}Database created successfully!${NC}"
echo -e "Endpoint: ${GREEN}$DB_ENDPOINT${NC}"
echo -e "Port: ${GREEN}$DB_PORT${NC}"
echo -e "Database URL: ${GREEN}$DATABASE_URL${NC}"

# Step 2: Run Prisma migrations
echo -e "${YELLOW}Step 2: Running Prisma migrations...${NC}"

# Create a temporary .env file with the DATABASE_URL
echo "DATABASE_URL=\"$DATABASE_URL\"" > .env

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
npx prisma migrate dev --name init

# Seed the database
echo -e "${YELLOW}Seeding the database...${NC}"
npx ts-node scripts/init-db.ts

echo -e "${GREEN}Database migrations and seeding completed successfully!${NC}"

# Step 3: Deploy to Amplify
echo -e "${YELLOW}Step 3: Deploying to AWS Amplify...${NC}"

# Check if git is initialized and has commits
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing git repository...${NC}"
  git init
  git add .
  git commit -m "Initial commit for Amplify deployment"
fi

# Check if current branch is main, if not create it
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo -e "${YELLOW}Creating and switching to $BRANCH branch...${NC}"
  git checkout -b $BRANCH
  git add .
  git commit -m "Prepare for Amplify deployment"
fi

# Check if the app already exists in Amplify
echo -e "${YELLOW}Checking if app already exists in Amplify...${NC}"
APP_ID=$(aws amplify list-apps --query "apps[?name=='$APP_NAME'].appId" --output text --region $REGION)

if [ -z "$APP_ID" ] || [ "$APP_ID" == "None" ]; then
  echo -e "${YELLOW}Creating new Amplify app...${NC}"
  
  # Ask for GitHub repository information
  echo -e "${YELLOW}We'll use GitHub for source control.${NC}"
  read -p "Enter your GitHub username: " GITHUB_USERNAME
  read -p "Enter your GitHub repository name: " GITHUB_REPO
  read -p "Enter your GitHub personal access token (with repo scope): " GITHUB_TOKEN
  
  # Create GitHub repository if it doesn't exist
  echo -e "${YELLOW}Checking if GitHub repository exists...${NC}"
  REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$GITHUB_USERNAME/$GITHUB_REPO)
  
  if [ "$REPO_EXISTS" == "404" ]; then
    echo -e "${YELLOW}Creating GitHub repository...${NC}"
    curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user/repos -d "{\"name\":\"$GITHUB_REPO\", \"private\":true}"
  fi
  
  # Add GitHub as remote and push
  echo -e "${YELLOW}Adding GitHub remote...${NC}"
  git remote add github https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$GITHUB_REPO.git
  
  echo -e "${YELLOW}Pushing code to GitHub...${NC}"
  git push -u github $BRANCH
  
  # Create the Amplify app
  echo -e "${YELLOW}Creating Amplify app from GitHub repository...${NC}"
  REPO_URL="https://github.com/$GITHUB_USERNAME/$GITHUB_REPO"
  
  # Create app with manual OAuth setup
  echo -e "${YELLOW}Please follow these steps to create your Amplify app:${NC}"
  echo -e "1. Go to AWS Amplify Console: https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/create"
  echo -e "2. Select 'GitHub' as the repository service"
  echo -e "3. Connect to your GitHub account and select repository: $GITHUB_USERNAME/$GITHUB_REPO"
  echo -e "4. Select branch: $BRANCH"
  echo -e "5. Enter app name: $APP_NAME"
  echo -e "6. Use the existing amplify.yml file in your repository"
  echo -e "7. Click 'Create app'"
  
  read -p "Press Enter once you've created the app in the console..." DUMMY
  
  # Get the app ID
  APP_ID=$(aws amplify list-apps --query "apps[?name=='$APP_NAME'].appId" --output text --region $REGION)
  
  if [ -z "$APP_ID" ] || [ "$APP_ID" == "None" ]; then
    echo -e "${RED}Failed to find the app in Amplify. Please make sure you created it with the name '$APP_NAME'.${NC}"
    exit 1
  fi
    
else
  echo -e "${YELLOW}App already exists with ID: $APP_ID. Updating...${NC}"
  
  # Check if GitHub remote exists
  REMOTE_EXISTS=$(git remote | grep github || echo "")
  
  if [ -z "$REMOTE_EXISTS" ]; then
    echo -e "${YELLOW}Adding GitHub remote...${NC}"
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -p "Enter your GitHub repository name: " GITHUB_REPO
    read -p "Enter your GitHub personal access token (with repo scope): " GITHUB_TOKEN
    
    git remote add github https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$GITHUB_REPO.git
  fi
  
  # Push updates
  echo -e "${YELLOW}Pushing updates to GitHub...${NC}"
  git add .
  git commit -m "Update application for deployment" || echo "No changes to commit"
  git push -u github $BRANCH
  
  # Start a new job
  echo -e "${YELLOW}Starting new deployment job...${NC}"
  aws amplify start-job \
    --app-id $APP_ID \
    --branch-name $BRANCH \
    --job-type RELEASE \
    --region $REGION
fi

# Add environment variables
echo -e "${YELLOW}Adding DATABASE_URL environment variable to Amplify...${NC}"
aws amplify update-branch \
  --app-id $APP_ID \
  --branch-name $BRANCH \
  --environment-variables DATABASE_URL=$DATABASE_URL \
  --region $REGION

# Start a new job if needed
echo -e "${YELLOW}Starting deployment with environment variables...${NC}"
aws amplify start-job \
  --app-id $APP_ID \
  --branch-name $BRANCH \
  --job-type RELEASE \
  --region $REGION

# Wait for deployment to complete
echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
aws amplify wait job-complete \
  --app-id $APP_ID \
  --branch-name $BRANCH \
  --job-id $(aws amplify list-jobs --app-id $APP_ID --branch-name $BRANCH --region $REGION --query "jobSummaries[0].jobId" --output text) \
  --region $REGION

# Get the app URL
DOMAIN=$(aws amplify get-app --app-id $APP_ID --region $REGION --query "app.defaultDomain" --output text)
FULL_URL="https://$BRANCH.$DOMAIN"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is available at: $FULL_URL${NC}"
echo -e "${GREEN}Database URL: $DATABASE_URL${NC}"
echo -e "${GREEN}=========================================${NC}"
