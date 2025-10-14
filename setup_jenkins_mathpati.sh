#!/bin/bash
set -e

# --------------------------
# Config
# --------------------------
JENKINS_CONTAINER="jenkins-node"
JENKINS_PORT=8090
PROJECT_DIR=$(pwd)
JOB_NAME="Mathpati-Build"
JOB_XML="mathpati-job.xml"

# --------------------------
# Step 1: Remove old Jenkins container
# --------------------------
echo "Stopping & removing old Jenkins container..."
docker rm -f $JENKINS_CONTAINER || true

# --------------------------
# Step 2: Build Jenkins + Node.js Docker image
# --------------------------
echo "Building custom Jenkins image with Node.js..."
cat > Dockerfile.jenkins <<EOF
FROM jenkins/jenkins:lts
USER root
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean
USER jenkins
EOF

docker build -t jenkins-node -f Dockerfile.jenkins .
rm Dockerfile.jenkins

# --------------------------
# Step 3: Run Jenkins container
# --------------------------
echo "Starting Jenkins container..."
docker run -d \
  --name $JENKINS_CONTAINER \
  -p $JENKINS_PORT:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v $PROJECT_DIR:/var/jenkins_home/workspace/$JOB_NAME \
  jenkins-node

# --------------------------
# Step 4: Wait for Jenkins to be ready
# --------------------------
echo "Waiting for Jenkins HTTP..."
until curl -s http://localhost:$JENKINS_PORT >/dev/null; do
  printf "."
  sleep 2
done
echo "HTTP ready!"

# Get initial admin password
ADMIN_PASS=$(docker exec $JENKINS_CONTAINER cat /var/jenkins_home/secrets/initialAdminPassword)
echo "Jenkins initial admin password: $ADMIN_PASS"

echo "Waiting for Jenkins CLI..."
until java -jar jenkins-cli.jar -s http://localhost:$JENKINS_PORT -auth admin:$ADMIN_PASS list-jobs >/dev/null 2>&1; do
  sleep 2
done
echo "Jenkins CLI ready!"

# --------------------------
# Step 5: Download Jenkins CLI
# --------------------------
echo "Downloading jenkins-cli.jar..."
wget -q http://localhost:$JENKINS_PORT/jnlpJars/jenkins-cli.jar -O jenkins-cli.jar

# --------------------------
# Step 6: Create safe job XML
# --------------------------
echo "Creating job XML..."
cat > $JOB_XML <<EOF
<project>
  <actions/>
  <description>Mathpati Build Job</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <scm class="hudson.scm.NullSCM"/>
  <canRoam>true</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers/>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>
        echo "Running build in workspace: \$WORKSPACE"
        cd \$WORKSPACE
        npm install
        npm run build
      </command>
    </hudson.tasks.Shell>
  </builders>
  <publishers/>
  <buildWrappers/>
</project>
EOF

# --------------------------
# Step 7: Remove old job if exists
# --------------------------
echo "Removing old job (if exists)..."
java -jar jenkins-cli.jar -s http://localhost:$JENKINS_PORT -auth admin:$ADMIN_PASS delete-job $JOB_NAME || true

# --------------------------
# Step 8: Create Jenkins job
# --------------------------
echo "Creating Jenkins job $JOB_NAME..."
java -jar jenkins-cli.jar -s http://localhost:$JENKINS_PORT -auth admin:$ADMIN_PASS create-job $JOB_NAME < $JOB_XML

# --------------------------
# Step 9: Trigger initial build
# --------------------------
echo "Triggering initial build..."
java -jar jenkins-cli.jar -s http://localhost:$JENKINS_PORT -auth admin:$ADMIN_PASS build $JOB_NAME -f

echo "Setup complete! Jenkins running at http://localhost:$JENKINS_PORT"

