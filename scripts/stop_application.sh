#!/bin/bash

# Stop the web server if it's running
systemctl is-active httpd && systemctl stop httpd