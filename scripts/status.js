#!/usr/bin/env bun
/**
 * Status checker for Self-Hosted AI Starter Kit
 */

import { parseArgs } from "util";
import { spawnSync } from "bun";
import { 
  log, 
  emojis, 
  colors,
  checkServicesStatus,
  serviceUrls 
} from "./utils.js";

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    detailed: { type: 'boolean', short: 'd' },
    help: { type: 'boolean', short: 'h' },
  },
});

// Help text
if (values.help) {
  console.log(`
${emojis.chart} Self-Hosted AI Starter Kit - Status Command

Usage: bun status [options]

Options:
  -d, --detailed  Show detailed container information
  -h, --help      Show this help

Examples:
  bun status     # Show basic status
  bun status -d  # Show detailed status with container info
`);
  process.exit(0);
}

/**
 * Get Docker system info
 */
function getDockerInfo() {
  try {
    const result = spawnSync(['docker', 'system', 'df', '--format', 'table'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (result.exitCode === 0) {
      return result.stdout.toString();
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

/**
 * Get detailed container information
 */
function getDetailedContainerInfo() {
  try {
    // Get AI stack containers
    const aiResult = spawnSync(['docker', 'compose', 'ps', '--format', 'table'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Get Supabase containers
    const supabaseResult = spawnSync(['docker', 'ps', '--filter', 'name=supabase_', '--format', 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    return {
      ai: aiResult.exitCode === 0 ? aiResult.stdout.toString() : null,
      supabase: supabaseResult.exitCode === 0 ? supabaseResult.stdout.toString() : null
    };
  } catch (error) {
    return { ai: null, supabase: null };
  }
}

/**
 * Get Supabase project information
 */
async function getSupabaseProjectInfo() {
  try {
    const result = spawnSync(['npx', 'supabase', 'projects', 'list'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (result.exitCode === 0) {
      const output = result.stdout.toString();
      const lines = output.trim().split('\n');
      
      // Find the linked project (marked with ●)
      for (const line of lines) {
        if (line.includes('●')) {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 4) {
            return {
              orgId: parts[1],
              projectId: parts[2], 
              name: parts[3]
            };
          }
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return null;
}

/**
 * Display service status with visual indicators
 */
async function displayServiceStatus(services) {
  const getStatusIcon = (isRunning) => 
    isRunning ? `${colors.green}${emojis.checkmark}${colors.reset}` : `${colors.red}●${colors.reset}`;
  
  log('Service Status:', 'header');
  console.log();
  
  // AI Stack
  log('AI Stack:', 'info');
  console.log(`  ${getStatusIcon(services.ai.postgres)}  PostgreSQL`);
  console.log(`  ${getStatusIcon(services.ai.n8n)}  n8n Workflows`);
  console.log(`  ${getStatusIcon(services.ai.ollama)}  Ollama LLM`);
  console.log(`  ${getStatusIcon(services.ai.qdrant)}  Qdrant Vector DB`);
  console.log(`  ${getStatusIcon(services.ai.openwebui)}  Open WebUI`);
  
  const aiRunning = Object.values(services.ai).filter(Boolean).length;
  const aiTotal = Object.keys(services.ai).length;
  console.log(`  ${colors.cyan}Status: ${aiRunning}/${aiTotal} services running${colors.reset}`);
  
  console.log();
  
  // Supabase
  const projectInfo = await getSupabaseProjectInfo();
  
  log('Supabase:', 'info');
  
  if (projectInfo) {
    console.log(`  ${getStatusIcon(services.supabase.running)}  Supabase Stack (Linked to ${projectInfo.name})`);
    if (services.supabase.running) {
      console.log(`  ${colors.cyan}Containers: ${services.supabase.containers} running${colors.reset}`);
      console.log(`  ${colors.cyan}Project ID: ${projectInfo.projectId}${colors.reset}`);
      console.log(`  ${colors.cyan}Org ID: ${projectInfo.orgId}${colors.reset}`);
    }
  } else {
    console.log(`  ${getStatusIcon(services.supabase.running)}  Supabase Stack`);
    if (services.supabase.running) {
      console.log(`  ${colors.cyan}Containers: ${services.supabase.containers} running${colors.reset}`);
    }
  }
  
  console.log();
}

/**
 * Display resource usage
 */
function displayResourceUsage() {
  try {
    // Get container resource usage
    const result = spawnSync(['docker', 'stats', '--no-stream', '--format', 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (result.exitCode === 0) {
      const output = result.stdout.toString();
      if (output.trim()) {
        log('Resource Usage:', 'info');
        console.log(output);
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Check service health by testing URLs
 */
async function checkServiceHealth() {
  log('Health Checks:', 'info');
  
  const healthChecks = [
    { name: 'n8n', url: serviceUrls.ai.n8n },
    { name: 'Open WebUI', url: serviceUrls.ai.openwebui },
    { name: 'Qdrant', url: serviceUrls.ai.qdrant },
    { name: 'Ollama', url: serviceUrls.ai.ollama },
    { name: 'Supabase Studio', url: serviceUrls.supabase.studio },
    { name: 'Supabase API', url: serviceUrls.supabase.api },
  ];
  
  for (const check of healthChecks) {
    try {
      const response = await fetch(check.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) 
      });
      
      const status = response.ok ? 
        `${colors.green}${emojis.checkmark}${colors.reset}` : 
        `${colors.yellow}⚠${colors.reset}`;
      
      console.log(`  ${status}  ${check.name} (${check.url})`);
    } catch (error) {
      console.log(`  ${colors.red}●${colors.reset}  ${check.name} (${check.url}) - ${colors.red}Not responding${colors.reset}`);
    }
  }
  
  console.log();
}

/**
 * Main execution
 */
async function main() {
  console.log(); // Add some space
  log(`Self-Hosted AI Starter Kit Status`, 'header');
  console.log();
  
  // Get service status
  const services = await checkServicesStatus();
  
  // Display basic status
  await displayServiceStatus(services);
  
  // Health checks
  await checkServiceHealth();
  
  // Detailed information if requested
  if (values.detailed) {
    log('Detailed Information:', 'info');
    console.log();
    
    const containerInfo = getDetailedContainerInfo();
    
    if (containerInfo.ai) {
      log('AI Stack Containers:', 'info');
      console.log(containerInfo.ai);
      console.log();
    }
    
    if (containerInfo.supabase) {
      log('Supabase Containers:', 'info');
      console.log(containerInfo.supabase);
      console.log();
    }
    
    // Resource usage
    displayResourceUsage();
    
    // Docker system info
    const dockerInfo = getDockerInfo();
    if (dockerInfo) {
      log('Docker System Usage:', 'info');
      console.log(dockerInfo);
    }
  }
  
  // Summary
  const aiRunning = Object.values(services.ai).some(Boolean);
  const supabaseRunning = services.supabase.running;
  
  if (aiRunning || supabaseRunning) {
    log('Stack is operational!', 'success');
    console.log();
    log('Quick actions:', 'info');
    console.log(`  URLs:  ${emojis.globe} bun urls`);
    console.log(`  Logs:  ${emojis.package} bun logs`);
    console.log(`  Stop:  ${emojis.stop} bun stop`);
  } else {
    log('No services are currently running', 'warning');
    console.log();
    log('Start services:', 'info');
    console.log(`  ${emojis.rocket} bun start`);
    console.log(`  ${emojis.rocket} bun start ai`);
    console.log(`  ${emojis.rocket} bun start supabase`);
  }
  
  console.log();
}

// Run main function
main().catch((error) => {
  log(`Error checking status: ${error.message}`, 'error');
  process.exit(1);
});