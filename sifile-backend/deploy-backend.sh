#!/bin/bash
# Skrip helper untuk mende-deploy backend SiFile ke Google Cloud Run

PROJECT_ID="sifile-app" # Ganti jika nama project berbeda
REGION="asia-southeast2"
SERVICE_NAME="sifile-backend"

echo "Mendeploy SiFile Backend ke Google Cloud Run ($REGION)..."

gcloud run deploy $SERVICE_NAME --quiet \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,MAX_FILE_SIZE_MB=200 \
  --min-instances=0 \
  --max-instances=5 \
  --memory=1Gi

echo "Deploy selesai!"
