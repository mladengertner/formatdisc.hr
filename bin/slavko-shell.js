#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const root = path.resolve(__dirname, '..'); // Assuming bin/ is one level deep

switch (args[0]) {
    case 'build':
        console.log('Running production build...');
        execSync('npm run build', { stdio: 'inherit', cwd: root });
        break;
    case 'dev':
        console.log('Starting dev server...');
        execSync('npm run dev', { stdio: 'inherit', cwd: root });
        break;
    case 'docker':
        console.log('Building Docker image...');
        execSync('docker build -t formatdisc-shell .', { stdio: 'inherit', cwd: root });
        break;
    default:
        console.log(`
SlavkoShell CLI
Usage:
  build   - build production
  dev     - start dev server
  docker  - build docker image
    `);
}
