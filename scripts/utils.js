#!/usr/bin/env bun
/**
 * Utility functions for stack management
 */

import { spawn, spawnSync } from "bun";
import { existsSync } from "fs";

// Colors for console output
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Emoji helpers
export const emojis = {
  rocket: '🚀',
  checkmark: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  stop: '🛑',
  gear: '⚙️',
  database: '🗄️',
  brain: '🧠',
  globe: '🌐',
  package: '📦',
  chart: '📊',
  link: '🔗',
};

/**
 * Enhanced console logging with colors and emojis
 */
export function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = '';
  let color = colors.reset;
  
  switch (type) {
    case 'success':
      prefix = `${emojis.checkmark}`;
      color = colors.green;
      break;
    case 'error':
      prefix = `${emojis.error}`;
      color = colors.red;
      break;
    case 'warning':
      prefix = `${emojis.warning}`;
      color = colors.yellow;
      break;
    case 'info':
      prefix = `${emojis.info}`;
      color = colors.blue;
      break;
    case 'header':
      prefix = `${emojis.rocket}`;
      color = colors.cyan + colors.bright;
      break;
  }
  
  console.log(`${color}${prefix} ${message}${colors.reset}`);
}

/**
 * Check if Docker is running
 */
export async function checkDocker() {
  try {
    const result = spawnSync(['docker', 'info'], { stdio: ['ignore', 'pipe', 'pipe'] });
    return result.exitCode === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a port is in use
 */
export async function checkPort(port) {
  try {
    const result = spawnSync(['lsof', '-i', `:${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    return result.exitCode === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Detect GPU type for auto-configuration
 */
export async function detectGPU() {
  try {
    // Check for NVIDIA
    const nvidiaResult = spawnSync(['nvidia-smi'], { stdio: ['ignore', 'pipe', 'pipe'] });
    if (nvidiaResult.exitCode === 0) {
      return 'gpu-nvidia';
    }
    
    // Check for AMD (Linux only)
    if (process.platform === 'linux') {
      const amdResult = spawnSync(['rocm-smi'], { stdio: ['ignore', 'pipe', 'pipe'] });
      if (amdResult.exitCode === 0) {
        return 'gpu-amd';
      }
    }
    
    return 'cpu';
  } catch (error) {
    return 'cpu';
  }
}

/**
 * Check if environment files exist
 */
export function checkEnvironment() {
  const requiredFiles = ['.env', 'docker-compose.yml'];
  const missingFiles = requiredFiles.filter(file => !existsSync(file));
  
  if (missingFiles.length > 0) {
    log(`Missing required files: ${missingFiles.join(', ')}`, 'error');
    log('Please ensure you have copied .env.example to .env and have docker-compose.yml', 'warning');
    return false;
  }
  
  return true;
}

/**
 * Get Docker Compose command with profile
 */
export function getDockerComposeCommand(profile = 'cpu', withCloudflare = false) {
  let cmd = ['docker', 'compose'];
  
  if (profile !== 'none') {
    cmd.push('--profile', profile);
  }
  
  if (withCloudflare) {
    cmd.push('--profile', 'cloudflare');
  }
  
  return cmd;
}

/**
 * Check if services are running
 */
export async function checkServicesStatus() {
  const services = {
    ai: {
      postgres: false,
      n8n: false,
      ollama: false,
      qdrant: false,
      openwebui: false,
    },
    supabase: {
      running: false,
      containers: 0,
    }
  };
  
  try {
    // Check Docker Compose services
    const dockerResult = spawnSync(['docker', 'compose', 'ps', '--format', 'json'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (dockerResult.exitCode === 0) {
      const output = dockerResult.stdout.toString();
      if (output.trim()) {
        const containers = output.trim().split('\n').map(line => JSON.parse(line));
        
        for (const container of containers) {
          if (container.State === 'running') {
            if (container.Service === 'postgres') services.ai.postgres = true;
            if (container.Service === 'n8n') services.ai.n8n = true;
            if (container.Service.includes('ollama')) services.ai.ollama = true;
            if (container.Service === 'qdrant') services.ai.qdrant = true;
            if (container.Service === 'open-webui') services.ai.openwebui = true;
          }
        }
      }
    }
    
    // Check Supabase
    const supabaseResult = spawnSync(['npx', 'supabase', 'status'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (supabaseResult.exitCode === 0) {
      services.supabase.running = true;
      
      // Count Supabase containers
      const supabaseContainers = spawnSync(['docker', 'ps', '--filter', 'name=supabase_', '--format', '{{.Names}}'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      if (supabaseContainers.exitCode === 0) {
        const containerList = supabaseContainers.stdout.toString().trim();
        services.supabase.containers = containerList ? containerList.split('\n').length : 0;
      }
    }
    
  } catch (error) {
    log(`Error checking service status: ${error.message}`, 'error');
  }
  
  return services;
}

/**
 * Execute command with streaming output
 */
export async function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
    
    proc.stdout.on('data', (data) => {
      if (!options.quiet) {
        process.stdout.write(data);
      }
    });
    
    proc.stderr.on('data', (data) => {
      if (!options.quiet) {
        process.stderr.write(data);
      }
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Service URLs
 */
export const serviceUrls = {
  ai: {
    n8n: 'http://localhost:5678',
    openwebui: 'http://localhost:3000',
    qdrant: 'http://localhost:6333',
    ollama: 'http://localhost:11434',
  },
  supabase: {
    studio: 'http://localhost:54323',
    api: 'http://localhost:54321',
    database: 'postgresql://postgres:postgres@localhost:54322/postgres',
    inbucket: 'http://localhost:54324',
  }
};

/**
 * Display service URLs
 */
export function displayUrls(stack = 'all') {
  log('Service URLs:', 'header');
  console.log();
  
  if (stack === 'all' || stack === 'ai') {
    log('AI Services:', 'info');
    console.log(`  ${emojis.brain} n8n Workflows:     ${colors.cyan}${serviceUrls.ai.n8n}${colors.reset}`);
    console.log(`  ${emojis.brain} Open WebUI:        ${colors.cyan}${serviceUrls.ai.openwebui}${colors.reset}`);
    console.log(`  ${emojis.database} Qdrant Vector DB:  ${colors.cyan}${serviceUrls.ai.qdrant}${colors.reset}`);
    console.log(`  ${emojis.gear} Ollama API:        ${colors.cyan}${serviceUrls.ai.ollama}${colors.reset}`);
    console.log();
  }
  
  if (stack === 'all' || stack === 'supabase') {
    log('Supabase Services:', 'info');
    console.log(`  ${emojis.database} Studio:            ${colors.cyan}${serviceUrls.supabase.studio}${colors.reset}`);
    console.log(`  ${emojis.link} API:               ${colors.cyan}${serviceUrls.supabase.api}${colors.reset}`);
    console.log(`  ${emojis.database} Database:          ${colors.cyan}${serviceUrls.supabase.database}${colors.reset}`);
    console.log(`  ${emojis.package} Inbucket (Email):  ${colors.cyan}${serviceUrls.supabase.inbucket}${colors.reset}`);
    console.log();
  }
}