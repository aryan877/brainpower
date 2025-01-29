#!/bin/bash

# Pull latest changes from git
git pull

# Build and start containers with docker compose
docker compose build
docker compose up -d
