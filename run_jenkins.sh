#!/bin/bash

# Stop and remove old Jenkins container if exists
if [ "$(docker ps -aq -f name=jenkins)" ]; then
    echo "Stopping and removing existing Jenkins container..."
    docker stop jenkins
    docker rm jenkins
fi

# Stop and remove mathpati container if it conflicts
if [ "$(docker ps -aq -f name=mathpati)" ]; then
    echo "Stopping and removing existing mathpati container..."
    docker stop mathpati
    docker rm mathpati
fi

# Run Jenkins on a free port (8090)
echo "Starting Jenkins container..."
docker run -d \
  --name jenkins \
  -p 8090:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

echo "Jenkins should now be running on http://localhost:8090"
