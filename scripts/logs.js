#!/usr/bin/env bun
/**
 * Logs viewer for Self-Hosted AI Starter Kit
 */

import { parseArgs } from "util";
import { spawn } from "bun";
import { 
  log, 
  emojis, 
  colors,
  executeCommand 
} from "./utils.js";

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    follow: { type: 'boolean', short: 'f' },
    tail: { type: 'string', short: 't' },
    since: { type: 'string', short: 's' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

const target = positionals[0] || 'all';

// Help text
if (values.help) {
  console.log(`
${emojis.package} Self-Hosted AI Starter Kit - Logs Command

Usage: bun logs [target] [options]

Targets:
  all         Show logs from all services (default)
  ai          Show AI stack logs only
  supabase    Show Supabase logs only
  [service]   Show specific service logs (n8n, ollama, qdrant, etc.)

Options:
  -f, --follow        Follow log output (like tail -f)
  -t, --tail <lines>  Number of lines to show from end (default: 50)
  -s, --since <time>  Show logs since timestamp (e.g., 2h, 30m, 2023-01-01)
  -h, --help          Show this help

Examples:
  bun logs              # Show recent logs from all services
  bun logs -f           # Follow all logs in real-time
  bun logs ai -t 100    # Show last 100 lines from AI stack
  bun logs n8n -f       # Follow n8n logs specifically
  bun logs --since 1h   # Show logs from last hour
`);
  process.exit(0);
}

/**
 * Get AI stack logs
 */
async function getAILogs(options = {}) {
  const cmd = ['docker', 'compose', 'logs'];
  
  if (options.follow) cmd.push('-f');
  if (options.tail) cmd.push('--tail', options.tail);
  if (options.since) cmd.push('--since', options.since);
  
  return cmd;
}

/**
 * Get Supabase logs
 */
async function getSupabaseLogs(options = {}) {
  // For Supabase, we'll use docker logs on the containers
  const cmd = ['docker', 'logs'];
  
  if (options.follow) cmd.push('-f');
  if (options.tail) cmd.push('--tail', options.tail);
  if (options.since) cmd.push('--since', options.since);
  
  return cmd;
}

/**
 * Get specific service logs
 */
async function getServiceLogs(service, options = {}) {
  // Check if it's an AI service
  const aiServices = ['n8n', 'postgres', 'ollama', 'qdrant', 'open-webui'];
  
  if (aiServices.includes(service) || service.includes('ollama')) {
    const cmd = await getAILogs(options);
    cmd.push(service);
    return { type: 'compose', cmd };
  }
  
  // Check if it's a Supabase service
  if (service.startsWith('supabase')) {
    const cmd = await getSupabaseLogs(options);
    cmd.push(service);
    return { type: 'docker', cmd };
  }
  
  // Try to find the container
  try {
    const result = await Bun.spawn(['docker', 'ps', '--format', '{{.Names}}', '--filter', `name=${service}`], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    const stdout = await result.text();
    const containers = stdout.trim().split('\n').filter(Boolean);
    
    if (containers.length > 0) {
      const cmd = await getSupabaseLogs(options);
      cmd.push(containers[0]);
      return { type: 'docker', cmd };
    }
  } catch (error) {
    // Ignore
  }
  
  throw new Error(`Service '${service}' not found`);
}

/**
 * List available services
 */
async function listServices() {
  log('Available services:', 'info');
  console.log();
  
  // AI Stack services
  try {
    const aiResult = await Bun.spawn(['docker', 'compose', 'config', '--services'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (aiResult.exitCode === 0) {
      const services = (await aiResult.text()).trim().split('\n').filter(Boolean);
      if (services.length > 0) {
        log('AI Stack:', 'info');
        services.forEach(service => console.log(`  ${colors.cyan}${service}${colors.reset}`));
        console.log();
      }
    }
  } catch (error) {
    // Ignore
  }
  
  // Supabase services
  try {
    const supabaseResult = await Bun.spawn(['docker', 'ps', '--filter', 'name=supabase_', '--format', '{{.Names}}'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (supabaseResult.exitCode === 0) {
      const containers = (await supabaseResult.text()).trim().split('\n').filter(Boolean);
      if (containers.length > 0) {
        log('Supabase:', 'info');
        containers.forEach(container => {
          const serviceName = container.replace(/^supabase_/, '').replace(/_.*$/, '');
          console.log(`  ${colors.cyan}${serviceName}${colors.reset} (${container})`);
        });
        console.log();
      }
    }
  } catch (error) {
    // Ignore
  }
}

/**
 * Show combined logs from multiple sources
 */
async function showCombinedLogs(options = {}) {
  log('Showing combined logs from all services...', 'info');
  console.log(`${colors.yellow}Note: Press Ctrl+C to stop following logs${colors.reset}`);
  console.log();
  
  // Create array to hold promises
  const logPromises = [];
  
  // AI Stack logs
  try {
    const aiCmd = await getAILogs(options);
    logPromises.push(
      spawn(aiCmd[0], aiCmd.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] })
    );
  } catch (error) {
    log(`Could not get AI stack logs: ${error.message}`, 'warning');
  }
  
  // For combined logs, we'll primarily use docker compose logs
  // as it handles multiple services better
  if (logPromises.length > 0) {
    const proc = logPromises[0];
    
    proc.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    proc.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    await proc.exited;
  }
}

/**
 * Main execution
 */
async function main() {
  const follow = values.follow || false;
  const tail = values.tail || '50';
  const since = values.since;
  
  const options = { follow, tail, since };
  
  console.log(); // Add some space
  
  if (target === 'list') {
    await listServices();
    return;
  }
  
  try {
    if (target === 'all') {
      log(`Viewing logs from all services (last ${tail} lines)`, 'header');
      if (follow) log('Following logs in real-time...', 'info');
      console.log();
      
      await showCombinedLogs(options);
    } else if (target === 'ai') {
      log(`Viewing AI stack logs (last ${tail} lines)`, 'header');
      if (follow) log('Following logs in real-time...', 'info');
      console.log();
      
      const cmd = await getAILogs(options);
      const logResult = await Bun.spawn(cmd, {
        stdio: ['ignore', 'inherit', 'inherit']
      });
      await logResult.exited;
    } else if (target === 'supabase') {
      log(`Viewing Supabase logs`, 'header');
      if (follow) log('Following logs in real-time...', 'info');
      console.log();
      
      // Show logs from all Supabase containers
      try {
        const result = await Bun.spawn(['docker', 'ps', '--filter', 'name=supabase_', '--format', '{{.Names}}'], {
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        const containers = (await result.text()).trim().split('\n').filter(Boolean);
        
        if (containers.length === 0) {
          log('No Supabase containers found', 'warning');
          return;
        }
        
        // Show logs from first container (could be enhanced to show all)
        const cmd = await getSupabaseLogs(options);
        cmd.push(containers[0]);
        const logResult = await Bun.spawn(cmd, {
          stdio: ['ignore', 'inherit', 'inherit']
        });
        await logResult.exited;
      } catch (error) {
        log(`Error getting Supabase logs: ${error.message}`, 'error');
      }
    } else {
      // Specific service
      log(`Viewing ${target} logs (last ${tail} lines)`, 'header');
      if (follow) log('Following logs in real-time...', 'info');
      console.log();
      
      const { type, cmd } = await getServiceLogs(target, options);
      
      if (!Array.isArray(cmd) || cmd.length === 0) {
        throw new Error(`Invalid command returned for service ${target}. Got: ${JSON.stringify(cmd)}`);
      }
      
      // Use Bun.spawn directly instead of executeCommand  
      const logResult = await Bun.spawn(cmd, {
        stdio: ['ignore', 'inherit', 'inherit']
      });
      
      await logResult.exited;
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    console.log();
    log('Available targets: all, ai, supabase, [service-name]', 'info');
    log('Use "bun logs list" to see available services', 'info');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n');
  log('Log viewing stopped', 'info');
  process.exit(0);
});

// Run main function
main().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});