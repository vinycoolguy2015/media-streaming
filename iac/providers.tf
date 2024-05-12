terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "YOUR_S3_BUCKET"
    key    = "streaming-service.tfstate"
  }
}

# Configure the AWS Provider
provider "aws" {}
