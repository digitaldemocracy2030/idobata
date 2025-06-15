#!/bin/bash
# scripts/plan.sh

cd environments/${ENV:-stg}
terraform plan -var-file="terraform.tfvars"