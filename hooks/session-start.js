#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigManager = require('../lib/config-manager');
const CostEngine = require('../lib/cost-engine');
const BuiltinCoordinator = require('../lib/builtin-coordinator');
const SetupWizard = require('../lib/setup/wizard');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PLUGIN_DIR, 'config', 'session-state.json');

async function main() {
  const configManager = new ConfigManager();
  const costEngine = new CostEngine(configManager);
  const builtinCoordinator = new BuiltinCoordinator(configManager);
  const wizard = new SetupWizard(configManager);

  const mode = configManager.getCurrentMode();
  const config = configManager.getMergedConfig();
  const setupStatus = wizard.getSetupStatus();

  console.log(`[claude-opt-pro] Session starting in ${mode} mode`);
  console.log(`[claude-opt-pro] Agent: ${setupStatus.agentName}`);

  if (setupStatus.needsSetup) {
    console.log('');
    console.log('[claude-opt-pro] ==========================================');
    console.log('[claude-opt-pro] Welcome! Claude Optimizer Pro needs initial setup.');
    console.log('[claude-opt-pro] Run /opt-setup to configure your preferences.');
    console.log('[claude-opt-pro] This includes model routing, integrations, and budget.');
    console.log('[claude-opt-pro] ==========================================');
    console.log('');
  }

  const integrations = await costEngine.checkAllIntegrations();
  const missingIntegrations = Object.entries(integrations)
    .filter(([_, status]) => !status.available)
    .map(([name, status]) => ({ name, ...status }));

  if (missingIntegrations.length > 0) {
    console.log(`[claude-opt-pro] Missing integrations: ${missingIntegrations.map(i => i.name).join(', ')}`);
    if (config.integrations && Object.keys(config.integrations).some(k => config.integrations[k]?.auto_install)) {
      console.log('[claude-opt-pro] Run /opt-config to auto-install missing integrations');
    }
  }

  const state = {
    mode,
    startTime: new Date().toISOString(),
    integrations,
    missingIntegrations,
    sessionTokens: 0,
    sessionCost: 0,
    suggestions: [],
    setupComplete: setupStatus.setupComplete,
    agent: setupStatus.agent
  };

  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[claude-opt-pro] Failed to save session state:', e.message);
  }

  if (builtinCoordinator.shouldInit(process.cwd())) {
    console.log('[claude-opt-pro] No CLAUDE.md found. Consider running /init to set up project context.');
  }

  const builtinConfig = configManager.getBuiltinCommands();
  if (builtinConfig) {
    console.log(`[claude-opt-pro] Auto-compact at ${builtinConfig.auto_compact_threshold || 60}%, auto-clear on task switch: ${builtinConfig.auto_clear_on_task_switch}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[claude-opt-pro] SessionStart hook error:', err.message);
  process.exit(0);
});
