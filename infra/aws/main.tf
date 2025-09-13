provider "aws" {
  region  = "ap-south-1"
  profile = "default"
}

resource "aws_ecr_repository" "mathpati_repo" {
  name = "Mathpati-frontend"
}

resource "aws_eks_cluster" "mathpati" {
  name     = "Mathpati-cluster"
  role_arn = "arn:aws:iam::<ACCOUNT_ID>:role/EKSClusterRole"

  vpc_config {
    subnet_ids = ["subnet-xxxxxx"] # replace with real subnet IDs
  }
}

resource "aws_s3_bucket" "mathpati_assets" {
  bucket = "Mathpati-assets-nakshatra"
}

resource "aws_instance" "mathpati_server" {
  ami           = "ami-0e742cca61fb65051"
  instance_type = "t2.micro"

  tags = {
    Name = "Mathpati-server"
  }
}
