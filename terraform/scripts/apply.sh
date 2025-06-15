#!/bin/bash
# scripts/apply.sh

cd environments/${ENV:-stg}
terraform apply -var-file="terraform.tfvars" -auto-approve=${AUTO_APPROVE:-false}