#!/bin/bash
# scripts/init.sh

cd environments/${ENV:-stg}
terraform init -backend-config="bucket=${TF_STATE_BUCKET}"