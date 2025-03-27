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
DB_USER="admin"
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
  REGION="us-east-1"
fi
STACK_NAME="$APP_NAME-db"

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}  Creating PostgreSQL RDS Database       ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Check if CloudFormation stack exists
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION 2>/dev/null || echo "false")

if [ "$STACK_EXISTS" == "false" ]; then
  echo -e "${YELLOW}Creating new database stack...${NC}"
  
  # Create a temporary CloudFormation template for the database
  cat > /tmp/db-template.yml << EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: 'PostgreSQL RDS Database for Onboarding App'

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
      GroupDescription: Security group for PostgreSQL database
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          CidrIp: 0.0.0.0/0

  DatabaseSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub \${AWS::StackName}-db-secret
      GenerateSecretString:
        SecretStringTemplate: !Sub '{"username": "\${DatabaseUser}"}'
        GenerateStringKey: "password"
        PasswordLength: 16
        ExcludeCharacters: '"@/\\'

  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for PostgreSQL database
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  PostgreSQLInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBName: !Ref DatabaseName
      Engine: postgres
      EngineVersion: '14.6'
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      StorageType: gp2
      MasterUsername: !Ref DatabaseUser
      MasterUserPassword: !Sub '{{resolve:secretsmanager:\${DatabaseSecret}:SecretString:password}}'
      DBSubnetGroupName: !Ref DBSubnetGroup
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      PubliclyAccessible: true
      MultiAZ: false
      BackupRetentionPeriod: 7
      DeletionProtection: false

Outputs:
  DatabaseEndpoint:
    Description: PostgreSQL Endpoint
    Value: !GetAtt PostgreSQLInstance.Endpoint.Address
    Export:
      Name: !Sub \${AWS::StackName}-DatabaseEndpoint
  
  DatabasePort:
    Description: PostgreSQL Port
    Value: !GetAtt PostgreSQLInstance.Endpoint.Port
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
    Value: !Ref DatabaseSecret
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
  echo -e "${YELLOW}This may take 5-10 minutes. Please be patient.${NC}"
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
echo -e "${GREEN}You can now use this DATABASE_URL in your Amplify environment variables.${NC}"
