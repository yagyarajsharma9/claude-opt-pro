#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigManager = require('../lib/config-manager');
const CostEngine = require('../lib/cost-engine');
const QualityEngine = require('../lib/quality-engine');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PLUGIN_DIR, 'config', 'session-state.json');
const METRICS_FILE = path.join(PLUGIN_DIR, 'config', 'metrics.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveMetrics(metrics) {
  try {
    const existing = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    existing.sessions.push(metrics);
    if (existing.sessions.length > 100) {
      existing.sessions = existing.sessions.slice(-100);
    }
    fs.writeFileSync(METRICS_FILE, JSON.stringify(existing, null, 2));
  } catch (e) {
    const newMetrics = { sessions: [metrics] };
    fs.writeFileSync(METRICS_FILE, JSON.stringify(newMetrics, null, 2));
  }
}

function getHookInput() {
  if (process.env.CLAUDE_HOOK_INPUT) {
    try {
      return JSON.parse(process.env.CLAUDE_HOOK_INPUT);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function main() {
  const configManager = new ConfigManager();
  const costEngine = new CostEngine(configManager);
  const qualityEngine = new QualityEngine(configManager);

  const hookInput = getHookInput();
  const toolName = hookInput?.tool?.name || hookInput?.toolName || 'unknown';
  const toolOutput = hookInput?.tool?.output || hookInput?.output || '';

  const state = loadState() || {
    mode: configManager.getCurrentMode(),
    sessionTokens: 0,
    sessionCost: 0
  };

  if (typeof toolOutput === 'string' && toolOutput.length > 0) {
    const estimatedTokens = Math.ceil(toolOutput.length / 4);
    state.sessionTokens += estimatedTokens;
    costEngine.updateSessionTokens(estimatedTokens);
  }

  if (toolName === 'Bash') {
    const outputLines = typeof toolOutput === 'string' ? toolOutput.split('\n').length : 0;
    if (outputLines > 50) {
      const savings = Math.ceil(outputLines * 0.7 * 10);
      costEngine.recordSavings('rtk', savings);
      state.suggestions = state.suggestions || [];
      state.suggestions.push({
        type: 'rtk_savings',
        message: `RTK saved ~${savings} tokens on command output`,
        timestamp: new Date().toISOString()
      });
    }
  }

  const config = configManager.getMergedConfig();
  const metrics = {
    timestamp: new Date().toISOString(),
    mode: configManager.getCurrentMode(),
    sessionTokens: state.sessionTokens,
    sessionCost: state.sessionCost,
    qualityMetrics: qualityEngine.getQualityMetrics(),
    costMetrics: costEngine.getCostMetrics(),
    toolName,
    toolOutputLength: typeof toolOutput === 'string' ? toolOutput.length : 0
  };

  saveMetrics(metrics);

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('[claude-opt-pro] PostToolUse hook error:', err.message);
  process.exit(0);
});
