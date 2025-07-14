terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.84"
    }
  }

  backend "s3" {
    bucket = "dev-params-tfstate"
    key    = "streaming-service.tfstate"
  }
}

# Configure the AWS Provider
provider "aws" {}
