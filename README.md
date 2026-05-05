# DevOps Complete Project

Automated CI/CD pipeline using AWS, Terraform, Docker, and GitHub Actions.

## Project Structure

```
devops-project/
├── app/                          # Application
│   ├── server.js               # Node.js Express app
│   ├── package.json            # Node.js dependencies
│   ├── Dockerfile             # Docker image definition
│   └── .github/
│       └── workflows/
│           └── deploy.yml      # GitHub Actions CI/CD
├── terraform/                   # Infrastructure as Code
│   ├── main.tf               # AWS resources
│   ├── variables.tf         # Input variables
│   └── outputs.tf           # Output values
└── README.md                # This file
```

## PART 1: Terraform Infrastructure

### Files Created

**variables.tf**
```hcl
variable "aws_region"           { default = "us-east-1" }
variable "vpc_cidr"            { default = "10.0.0.0/16" }
variable "public_subnet_1_cidr"  { default = "10.0.1.0/24" }
variable "public_subnet_2_cidr"  { default = "10.0.2.0/24" }
```

**main.tf** provisions:
- VPC (CIDR: 10.0.0.0/16)
- 2 Public Subnets in different AZs
- Internet Gateway
- Route Tables and Associations
- Security Group (SSH 22, HTTP 80)
- EC2 Instance (Ubuntu) with Docker auto-installed

## PART 2: Application

**server.js** - Simple Express app:
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('GitHub Actions CI/CD Working 🚀');
});

app.listen(80, '0.0.0.0', () => {
  console.log('Server running on port 80');
});
```

## PART 3: GitHub Actions Workflow

**.github/workflows/deploy.yml**:
- Checkout Code
- Set up Docker Buildx
- Build Docker Image
- Login to Docker Hub (using secrets)
- Push Docker Image
- Deploy to AWS EC2 via SSH

## Step-by-Step Setup

### 1. Set Up GitHub Repository

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
gh repo create devops-project --public --source=. --push
# Or use: git remote add origin <your-repo-url>
# Then: git push -u origin main
```

### 2. Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:
| Secret Name | Description |
|------------|-------------|
| DOCKER_USERNAME | Your Docker Hub username |
| DOCKER_PASSWORD | Your Docker Hub password |
| SERVER_HOST | EC2 public IP address |
| SSH_PRIVATE_KEY | Private SSH key for EC2 |

### 3. Set Up AWS Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan resources
terraform plan -var "ami_id=<your-ubuntu-ami-id>"

# Apply (create resources)
terraform apply -var "ami_id=<your-ubuntu-ami-id>"
```

### 4. Configure Security

```bash
# Update ami_id with a valid Ubuntu AMI for your region
# Get AMI: AWS Console → EC2 → AMI Catalog → ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64
```

### 5. Push Code to Trigger Pipeline

```bash
# Make a change
echo "Test" >> server.js

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

### 6. Monitor Pipeline

- Go to **Actions** tab in GitHub
- Watch the workflow run
- Check logs for each step

### 7. Test the Application

After pipeline completes:
```
http://<EC2-PUBLIC-IP>/   # Should return: "GitHub Actions CI/CD Working 🚀"
```

## Running Locally

### Docker Build

```bash
cd app
docker build -t devops-project:latest .
docker run -d -p 80:80 devops-project:latest
# Visit: http://localhost
```

### Docker Compose

```bash
cd app
docker-compose up -d
```

## Testing

### Test Locally

```bash
# Build the image
docker build -t devops-project:latest .

# Run and test
docker run -d -p 80:80 --name test-app devops-project:latest
curl http://localhost
# Expected: "GitHub Actions CI/CD Working 🚀"
docker stop test-app
```

### Test Remote

```bash
curl http://<SERVER-IP>/
# Expected: "GitHub Actions CI/CD Working 🚀"
```

## GitHub Actions Secrets

| Secret | How to Get |
|--------|-------------|
| DOCKER_USERNAME | Sign up at hub.docker.com |
| DOCKER_PASSWORD | Your Docker Hub password |
| SERVER_HOST | `terraform output` after apply |
| SSH_PRIVATE_KEY | `cat ~/.ssh/id_rsa` |

## Terraform Outputs

After running `terraform apply`, you'll get:
- `vpc_id` - VPC ID
- `public_subnet_1` - Subnet 1 ID  
- `public_subnet_2` - Subnet 2 ID
- `web_server_public_ip` - EC2 Public IP
- `web_server_private_ip` - EC2 Private IP

## Clean Up

```bash
# Destroy AWS resources
cd terraform
terraform destroy

# Remove local Docker
docker stop devops-app
docker rm devops-app
docker rmi devops-project:latest
```

## Cost-Free Tips (AWS Free Tier)

- Use `t3.nano` or `t2.micro` instance types
- Stay under 750 hours/month
- Use 1 EC2 instance
- Clean up resources when not in use

## License

MIT License