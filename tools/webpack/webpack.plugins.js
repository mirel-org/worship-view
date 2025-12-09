const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  
  return env;
}

const env = loadEnv();

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.WORKERS_API_URL': JSON.stringify(
      env.WORKERS_API_URL || process.env.WORKERS_API_URL || 'http://localhost:8787'
    ),
  }),
];
