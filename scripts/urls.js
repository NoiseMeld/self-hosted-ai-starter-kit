#!/usr/bin/env bun
/**
 * URLs display for Self-Hosted AI Starter Kit
 */

import { parseArgs } from "util";
import { 
  log, 
  emojis, 
  colors,
  checkServicesStatus,
  serviceUrls,
  displayUrls 
} from "./utils.js";

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
  },
});

// Help text
if (values.help) {
  console.log(`
${emojis.globe} Self-Hosted AI Starter Kit - URLs Command

Usage: bun urls [options]

Options:
  -h, --help  Show this help

Description:
  Display all service URLs for running services.
  Only shows URLs for services that are currently running.

Examples:
  bun urls     # Show all service URLs
`);
  process.exit(0);
}

/**
 * Display URLs with service status
 */
async function displayUrlsWithStatus() {
  log('Service URLs:', 'header');
  console.log();
  
  // Get service status
  const services = await checkServicesStatus();
  
  const aiRunning = Object.values(services.ai).some(Boolean);
  const supabaseRunning = services.supabase.running;
  
  if (!aiRunning && !supabaseRunning) {
    log('No services are currently running', 'warning');
    console.log();
    log('Start services to see their URLs:', 'info');
    console.log(`  ${emojis.rocket} bun start`);
    console.log(`  ${emojis.rocket} bun start ai`);
    console.log(`  ${emojis.rocket} bun start supabase`);
    console.log();
    return;
  }
  
  // AI Services
  if (aiRunning) {
    log('AI Services:', 'info');
    
    if (services.ai.n8n) {
      console.log(`  ${emojis.brain} n8n Workflows:     ${colors.cyan}${serviceUrls.ai.n8n}${colors.reset}`);
    }
    
    if (services.ai.openwebui) {
      console.log(`  ${emojis.brain} Open WebUI:        ${colors.cyan}${serviceUrls.ai.openwebui}${colors.reset}`);
    }
    
    if (services.ai.qdrant) {
      console.log(`  ${emojis.database} Qdrant Vector DB:  ${colors.cyan}${serviceUrls.ai.qdrant}${colors.reset}`);
    }
    
    if (services.ai.ollama) {
      console.log(`  ${emojis.gear} Ollama API:        ${colors.cyan}${serviceUrls.ai.ollama}${colors.reset}`);
    }
    
    console.log();
  }
  
  // Supabase Services
  if (supabaseRunning) {
    log('Supabase Services:', 'info');
    console.log(`  ${emojis.database} Studio:            ${colors.cyan}${serviceUrls.supabase.studio}${colors.reset}`);
    console.log(`  ${emojis.link} API:               ${colors.cyan}${serviceUrls.supabase.api}${colors.reset}`);
    console.log(`  ${emojis.database} Database:          ${colors.cyan}${serviceUrls.supabase.database}${colors.reset}`);
    console.log(`  ${emojis.package} Inbucket (Email):  ${colors.cyan}${serviceUrls.supabase.inbucket}${colors.reset}`);
    console.log();
  }
  
  // Quick actions
  log('Quick actions:', 'info');
  console.log(`  Status: ${emojis.chart} bun status`);
  console.log(`  Logs:   ${emojis.package} bun logs`);
  console.log(`  Stop:   ${emojis.stop} bun stop`);
  console.log();
}

/**
 * Main execution
 */
async function main() {
  console.log(); // Add some space
  
  try {
    await displayUrlsWithStatus();
  } catch (error) {
    log(`Error getting service URLs: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});