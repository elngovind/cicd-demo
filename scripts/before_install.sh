#!/bin/bash

# Install dependencies
yum update -y
yum install -y httpd

# Remove existing files
if [ -d /var/www/html ]; then
  rm -rf /var/www/html/*
fi