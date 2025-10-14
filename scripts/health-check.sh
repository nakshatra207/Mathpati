#!/bin/bash

echo "=== Mathpati Health Check ==="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AWS_REGION=${AWS_REGION:-us-east-1}
CLUSTER_NAME=${CLUSTER_NAME:-mathpati-cluster}
SERVICE_NAME=${SERVICE_NAME:-mathpati-service}

# Check ECS Service
echo -e "${YELLOW}🔍 Checking ECS Service...${NC}"
SERVICE_STATUS=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' \
  --output json 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "$SERVICE_STATUS" | jq .
    RUNNING=$(echo "$SERVICE_STATUS" | jq -r '.Running')
    DESIRED=$(echo "$SERVICE_STATUS" | jq -r '.Desired')
    
    if [ "$RUNNING" == "$DESIRED" ]; then
        echo -e "${GREEN}✅ Service is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Service is scaling or unhealthy${NC}"
    fi
else
    echo -e "${RED}❌ Could not fetch service status${NC}"
fi

# Check ALB Target Health
echo ""
echo -e "${YELLOW}🔍 Checking ALB Target Health...${NC}"
TG_ARN=$(aws elbv2 describe-target-groups \
  --names mathpati-tg \
  --region $AWS_REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null)

if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
    TARGET_HEALTH=$(aws elbv2 describe-target-health \
      --target-group-arn $TG_ARN \
      --region $AWS_REGION \
      --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State,Reason:TargetHealth.Reason}' \
      --output json)
    
    echo "$TARGET_HEALTH" | jq .
    
    HEALTHY_COUNT=$(echo "$TARGET_HEALTH" | jq '[.[] | select(.Health=="healthy")] | length')
    TOTAL_COUNT=$(echo "$TARGET_HEALTH" | jq 'length')
    
    if [ "$HEALTHY_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ $HEALTHY_COUNT/$TOTAL_COUNT targets are healthy${NC}"
    else
        echo -e "${RED}❌ No healthy targets${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Target group not found${NC}"
fi

# Check Application URL
echo ""
echo -e "${YELLOW}🔍 Checking Application Endpoint...${NC}"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names mathpati-alb \
  --region $AWS_REGION \
  --query 'LoadBalancers[0].DNSName' \
  --output text 2>/dev/null)

if [ -n "$ALB_DNS" ] && [ "$ALB_DNS" != "None" ]; then
    echo "Application URL: http://$ALB_DNS"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$ALB_DNS/health --max-time 10)
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Application is responding (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${RED}❌ Application returned HTTP $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Load balancer not found${NC}"
fi

# Check Recent CloudWatch Alarms
echo ""
echo -e "${YELLOW}🔍 Checking CloudWatch Alarms...${NC}"
ALARMS=$(aws cloudwatch describe-alarms \
  --alarm-name-prefix mathpati \
  --state-value ALARM \
  --region $AWS_REGION \
  --query 'MetricAlarms[*].{Name:AlarmName,State:StateValue,Reason:StateReason}' \
  --output json 2>/dev/null)

ALARM_COUNT=$(echo "$ALARMS" | jq 'length')

if [ "$ALARM_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ $ALARM_COUNT alarm(s) in ALARM state:${NC}"
    echo "$ALARMS" | jq .
else
    echo -e "${GREEN}✅ No alarms in ALARM state${NC}"
fi

# Summary
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Health Check Summary${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$RUNNING" == "$DESIRED" ] && [ "$HEALTHY_COUNT" -gt 0 ] && [ "$HTTP_CODE" == "200" ] && [ "$ALARM_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some issues detected. Review the details above.${NC}"
    exit 1
fi
