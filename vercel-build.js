const { execSync } = require('child_process');
const path = require('path');

console.log('Running custom build script...');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

// Build the React app
console.log('Building React app...');
execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

console.log('Build completed successfully!');
