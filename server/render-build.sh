#!/bin/bash
set -e  # Exit on error

# Print environment for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Make sure the server has execute permissions
chmod +x index.js

# Print build information
echo "Build completed successfully!"
echo "Current directory: $(pwd)"
ls -la
