#!/bin/bash
echo "🔍 Running Trivy scan..."
trivy image mathpati-frontend || echo "⚠️ Trivy not installed"
