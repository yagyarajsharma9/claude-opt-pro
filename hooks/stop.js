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

function loadMetrics() {
  try {
    return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
  } catch (e) {
    return { sessions: [] };
  }
}

async function main() {
  const configManager = new ConfigManager();
  const costEngine = new CostEngine(configManager);
  const qualityEngine = new QualityEngine(configManager);

  const state = loadState() || {
    mode: configManager.getCurrentMode(),
    sessionTokens: 0,
    sessionCost: 0
  };

  const metrics = loadMetrics();
  const costMetrics = costEngine.getCostMetrics();
  const qualityMetrics = qualityEngine.getQualityMetrics();

  console.log('');
  console.log('=== Claude Optimizer Pro - Session Report ===');
  console.log('');
  console.log(`Mode: ${configManager.getCurrentMode()}`);
  console.log(`Session tokens: ${state.sessionTokens.toLocaleString()}`);
  console.log(`Tokens saved: ${costMetrics.totalTokensSaved.toLocaleString()}`);
  console.log('');

  console.log('Quality Metrics:');
  console.log(`  Karpathy compliance: ${qualityMetrics.karpathyCompliance}%`);
  console.log(`  Quality checks: ${qualityMetrics.passedChecks}/${qualityMetrics.totalChecks} passed`);
  console.log('');

  console.log('Cost Savings Breakdown:');
  console.log(`  RTK savings: ${costMetrics.rtkSavings.toLocaleString()} tokens`);
  console.log(`  Caveman savings: ${costMetrics.cavemanSavings.toLocaleString()} tokens`);
  console.log(`  Compact savings: ${costMetrics.compactSavings.toLocaleString()} tokens`);
  console.log('');

  if (state.suggestions && state.suggestions.length > 0) {
    console.log('Suggestions:');
    state.suggestions.slice(-5).forEach(s => {
      console.log(`  - ${s.message}`);
    });
    console.log('');
  }

  const allSessions = metrics.sessions;
  if (allSessions.length > 1) {
    const totalSaved = allSessions.reduce((sum, s) => sum + (s.costMetrics?.totalTokensSaved || 0), 0);
    console.log(`Total tokens saved across all sessions: ${totalSaved.toLocaleString()}`);
  }

  console.log('');
  console.log('Run /opt-dashboard for detailed metrics');
  console.log('');

  process.exit(0);
}

main().catch(err => {
  console.error('[claude-opt-pro] Stop hook error:', err.message);
  process.exit(0);
});
