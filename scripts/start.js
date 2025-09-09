#!/usr/bin/env bun
/**
 * Main start orchestrator for Self-Hosted AI Starter Kit
 */

import { parseArgs } from "util";
import { 
  log, 
  emojis, 
  checkDocker, 
  checkEnvironment, 
  detectGPU, 
  getDockerComposeCommand, 
  executeCommand,
  displayUrls 
} from "./utils.js";

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    profile: { type: 'string', short: 'p' },
    cloudflare: { type: 'boolean', short: 'c' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

const target = positionals[0] || 'all';

// Help text
if (values.help) {
  console.log(`
${emojis.rocket} Self-Hosted AI Starter Kit - Start Command

Usage: bun start [target] [options]

Targets:
  all         Start both AI stack and Supabase (default)
  ai          Start AI stack only (n8n, Ollama, Qdrant, Open WebUI)
  supabase    Start Supabase only

Options:
  -p, --profile    AI stack profile (cpu, gpu-nvidia, gpu-amd, auto-gpu)
  -c, --cloudflare Enable Cloudflare tunnel
  -h, --help       Show this help

Examples:
  bun start                    # Start everything with CPU profile
  bun start ai -p gpu-nvidia   # Start AI stack with NVIDIA GPU
  bun start:gpu                # Auto-detect and use GPU
  bun start:cloudflare         # Start with Cloudflare tunnel
  bun start supabase           # Start Supabase only
`);
  process.exit(0);
}

/**
 * Pre-flight checks
 */
async function preflightChecks() {
  log('Running pre-flight checks...', 'info');
  
  // Check Docker
  if (!(await checkDocker())) {
    log('Docker is not running or not installed', 'error');
    log('Please start Docker Desktop and try again', 'warning');
    process.exit(1);
  }
  
  // Check environment files
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  log('Pre-flight checks passed', 'success');
}

/**
 * Start AI stack
 */
async function startAIStack(profile = 'cpu', withCloudflare = false) {
  log(`Starting AI Stack (${profile} profile)...`, 'header');
  
  // Handle auto-gpu detection
  if (profile === 'auto-gpu') {
    log('Auto-detecting GPU...', 'info');
    profile = await detectGPU();
    log(`Detected profile: ${profile}`, 'info');
  }
  
  try {
    const cmd = getDockerComposeCommand(profile, withCloudflare);
    cmd.push('up', '-d');
    
    log(`Running: ${cmd.join(' ')}`, 'info');
    const result = await Bun.spawn(cmd, {
      stdio: ['ignore', 'inherit', 'inherit']
    });
    await result.exited;
    
    log('AI Stack started successfully', 'success');
    
    // Wait a moment for services to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  } catch (error) {
    log(`Failed to start AI stack: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Start Supabase
 */
async function startSupabase() {
  log('Starting Supabase...', 'header');
  
  try {
    // Check if already running
    const statusResult = await Bun.spawn(['npx', 'supabase', 'status'], {
      stdio: ['ignore', 'pipe', 'pipe']
    }).exited;
    
    if (statusResult === 0) {
      log('Supabase is already running', 'success');
      return true;
    }
    
    log('Initializing Supabase...', 'info');
    const result = await Bun.spawn(['npx', 'supabase', 'start'], {
      stdio: ['ignore', 'inherit', 'inherit']
    });
    await result.exited;
    
    log('Supabase started successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to start Supabase: ${error.message}`, 'error');
    log('Make sure Supabase CLI is installed: npm i -g @supabase/supabase-js', 'warning');
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(); // Add some space
  log(`Self-Hosted AI Starter Kit`, 'header');
  
  let profile = values.profile || 'cpu';
  const withCloudflare = values.cloudflare || false;
  
  // Handle convenience profiles
  if (target === 'gpu') {
    profile = 'auto-gpu';
  }
  
  console.log();
  await preflightChecks();
  console.log();
  
  let aiSuccess = true;
  let supabaseSuccess = true;
  
  // Start based on target
  if (target === 'all') {
    log(`Target: Both AI Stack + Supabase`, 'info');
    if (withCloudflare) log('Cloudflare: Enabled', 'info');
    console.log();
    
    aiSuccess = await startAIStack(profile, withCloudflare);
    console.log();
    
    if (aiSuccess) {
      supabaseSuccess = await startSupabase();
    }
  } else if (target === 'ai') {
    log(`Target: AI Stack only (${profile})`, 'info');
    if (withCloudflare) log('Cloudflare: Enabled', 'info');
    console.log();
    
    aiSuccess = await startAIStack(profile, withCloudflare);
    supabaseSuccess = true; // Not applicable
  } else if (target === 'supabase') {
    log(`Target: Supabase only`, 'info');
    console.log();
    
    supabaseSuccess = await startSupabase();
    aiSuccess = true; // Not applicable
  } else {
    log(`Unknown target: ${target}`, 'error');
    log('Valid targets: all, ai, supabase', 'warning');
    process.exit(1);
  }
  
  // Final status
  console.log();
  if (aiSuccess && supabaseSuccess) {
    log('Stack is ready!', 'success');
    console.log();
    displayUrls(target);
    
    log('Management commands:', 'info');
    console.log(`  Stop:   ${emojis.stop} bun stop`);
    console.log(`  Status: ${emojis.chart} bun status`);
    console.log(`  Logs:   ${emojis.package} bun logs`);
    console.log(`  URLs:   ${emojis.globe} bun urls`);
    console.log();
    log('Happy building!', 'success');
  } else {
    log('Some services failed to start', 'error');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n');
  log('Startup interrupted', 'warning');
  process.exit(0);
});

// Run main function
main().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});