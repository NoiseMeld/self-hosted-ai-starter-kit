#!/usr/bin/env bun
/**
 * Stop orchestrator for Self-Hosted AI Starter Kit
 */

import { parseArgs } from "util";
import { 
  log, 
  emojis, 
  executeCommand,
  checkServicesStatus,
  getDockerComposeCommand 
} from "./utils.js";

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    force: { type: 'boolean', short: 'f' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

const target = positionals[0] || 'all';

// Help text
if (values.help) {
  console.log(`
${emojis.stop} Self-Hosted AI Starter Kit - Stop Command

Usage: bun stop [target] [options]

Targets:
  all         Stop both AI stack and Supabase (default)
  ai          Stop AI stack only (Docker Compose services)
  supabase    Stop Supabase only

Options:
  -f, --force  Force stop (remove containers and networks)
  -h, --help   Show this help

Examples:
  bun stop           # Stop everything gracefully
  bun stop ai        # Stop AI stack only
  bun stop supabase  # Stop Supabase only
  bun stop -f        # Force stop and cleanup
`);
  process.exit(0);
}

/**
 * Detect which Docker Compose profile is currently running
 */
async function detectActiveProfile() {
  try {
    // Check if GPU containers are running
    const gpuResult = await Bun.spawn(['docker', 'ps', '--filter', 'name=ollama-gpu', '--format', '{{.Names}}'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    const gpuContainers = (await gpuResult.text()).trim();
    if (gpuContainers) {
      if (gpuContainers.includes('amd')) return 'gpu-amd';
      return 'gpu-nvidia';
    }
    
    // Default to CPU if no GPU containers found
    return 'cpu';
  } catch (error) {
    log('Could not detect active profile, defaulting to CPU', 'warning');
    return 'cpu';
  }
}

/**
 * Clean up standalone Ollama containers
 */
async function cleanupStandaloneOllama() {
  try {
    // Find standalone Ollama containers (not managed by compose)
    const result = await Bun.spawn(['docker', 'ps', '-a', '--filter', 'ancestor=ollama/ollama', '--format', '{{.Names}}'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    const containerList = (await result.text()).trim();
    if (containerList) {
      const containers = containerList.split('\n').filter(name => 
        name && !name.includes('self-hosted-ai-starter-kit')
      );
      
      if (containers.length > 0) {
        log(`Cleaning up standalone Ollama containers: ${containers.join(', ')}`, 'info');
        
        // Stop and remove the containers
        await Bun.spawn(['docker', 'rm', '-f', ...containers], {
          stdio: ['ignore', 'inherit', 'inherit']
        });
        
        log('Standalone Ollama containers cleaned up', 'success');
      }
    }
  } catch (error) {
    log(`Note: Could not clean up standalone Ollama containers: ${error.message}`, 'warning');
  }
}

/**
 * Stop AI stack
 */
async function stopAIStack(force = false) {
  log('Stopping AI Stack...', 'header');
  
  try {
    // Detect which profile is currently running
    const activeProfile = await detectActiveProfile();
    log(`Detected active profile: ${activeProfile}`, 'info');
    
    // Use the same profile as the running containers
    const cmd = getDockerComposeCommand(activeProfile, false);
    cmd.push('down');
    
    if (force) {
      cmd.push('--volumes', '--remove-orphans');
      log('Force mode: removing volumes and orphaned containers', 'warning');
    }
    
    log(`Running: ${cmd.join(' ')}`, 'info');
    const result = await Bun.spawn(cmd, {
      stdio: ['ignore', 'inherit', 'inherit']
    });
    await result.exited;
    
    log('AI Stack stopped successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to stop AI stack: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Stop Supabase
 */
async function stopSupabase() {
  log('Stopping Supabase...', 'header');
  
  try {
    // Check if running first
    const statusResult = await Bun.spawn(['npx', 'supabase', 'status'], {
      stdio: ['ignore', 'pipe', 'pipe']
    }).exited;
    
    if (statusResult !== 0) {
      log('Supabase is not running', 'info');
      return true;
    }
    
    const result = await Bun.spawn(['npx', 'supabase', 'stop'], {
      stdio: ['ignore', 'inherit', 'inherit']
    });
    await result.exited;
    
    log('Supabase stopped successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to stop Supabase: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Show current status before stopping
 */
async function showCurrentStatus() {
  log('Checking current status...', 'info');
  const services = await checkServicesStatus();
  
  const aiRunning = Object.values(services.ai).some(Boolean);
  const supabaseRunning = services.supabase.running;
  
  if (!aiRunning && !supabaseRunning) {
    log('No services are currently running', 'info');
    return false;
  }
  
  if (aiRunning) {
    log('AI stack services are running', 'info');
  }
  
  if (supabaseRunning) {
    log(`Supabase is running (${services.supabase.containers} containers)`, 'info');
  }
  
  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log(); // Add some space
  log(`Stopping Self-Hosted AI Starter Kit`, 'header');
  console.log();
  
  const force = values.force || false;
  
  // Show current status
  const hasRunningServices = await showCurrentStatus();
  
  if (!hasRunningServices) {
    log('Nothing to stop', 'success');
    process.exit(0);
  }
  
  console.log();
  log(`Target: ${target}`, 'info');
  if (force) log('Mode: Force stop with cleanup', 'warning');
  console.log();
  
  let aiSuccess = true;
  let supabaseSuccess = true;
  
  // Stop based on target
  if (target === 'all') {
    aiSuccess = await stopAIStack(force);
    console.log();
    
    if (aiSuccess) {
      supabaseSuccess = await stopSupabase();
    }
  } else if (target === 'ai') {
    aiSuccess = await stopAIStack(force);
    supabaseSuccess = true; // Not applicable
  } else if (target === 'supabase') {
    supabaseSuccess = await stopSupabase();
    aiSuccess = true; // Not applicable
  } else {
    log(`Unknown target: ${target}`, 'error');
    log('Valid targets: all, ai, supabase', 'warning');
    process.exit(1);
  }
  
  // Final status
  console.log();
  if (aiSuccess && supabaseSuccess) {
    log('All services stopped successfully', 'success');
    console.log();
    log('To start again:', 'info');
    console.log(`  ${emojis.rocket} bun start`);
    console.log(`  ${emojis.rocket} bun start ai`);
    console.log(`  ${emojis.rocket} bun start supabase`);
    console.log();
  } else {
    log('Some services failed to stop properly', 'error');
    log('You may need to check and stop them manually', 'warning');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n');
  log('Stop interrupted', 'warning');
  process.exit(0);
});

// Run main function
main().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});