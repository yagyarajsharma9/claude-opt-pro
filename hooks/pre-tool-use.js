#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigManager = require('../lib/config-manager');
const CostEngine = require('../lib/cost-engine');
const QualityEngine = require('../lib/quality-engine');
const BuiltinCoordinator = require('../lib/builtin-coordinator');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PLUGIN_DIR, 'config', 'session-state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveState(state) {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[claude-opt-pro] Failed to save state:', e.message);
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
  const input = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input.push(chunk));
  return new Promise(resolve => {
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(input.join('')));
      } catch (e) {
        resolve(null);
      }
    });
  });
}

async function main() {
  const configManager = new ConfigManager();
  const costEngine = new CostEngine(configManager);
  const qualityEngine = new QualityEngine(configManager);
  const builtinCoordinator = new BuiltinCoordinator(configManager);

  let hookInput;
  if (process.stdin.isTTY) {
    hookInput = null;
  } else {
    hookInput = await getHookInput();
  }

  const state = loadState() || {
    mode: configManager.getCurrentMode(),
    sessionTokens: 0,
    sessionCost: 0,
    suggestions: []
  };

  const toolName = hookInput?.tool?.name || hookInput?.toolName || 'unknown';
  const toolInput = hookInput?.tool?.input || hookInput?.input || {};

  if (toolName === 'Bash') {
    const command = toolInput.command || '';
    const config = configManager.getCostConfig();

    if (config.rtk_compression) {
      const rtkStatus = await costEngine.checkRTKIntegration();
      if (rtkStatus.available) {
        const rtkPrefix = 'rtk ';
        if (!command.startsWith(rtkPrefix) && !command.includes('rtk ')) {
          const rewrittenCommand = command.replace(/^(git|cargo|npm|pnpm|yarn|gh|docker|kubectl)\s/, `${rtkPrefix}$1 `);
          if (rewrittenCommand !== command) {
            console.log(`[claude-opt-pro] RTK: Rewriting command for token efficiency`);
          }
        }
      }
    }
  }

  if (toolName === 'Write' || toolName === 'Edit') {
    const filePath = toolInput.file_path || '';
    const content = toolInput.content || '';

    const qualityConfig = configManager.getQualityConfig();
    if (qualityConfig.karpathy_principles && content) {
      const context = {
        filesChanged: [filePath],
        complexity: content.split('\n').length / 10,
        isNewFeature: filePath.includes('feature') || filePath.includes('new'),
        hasTests: filePath.includes('test') || filePath.includes('spec')
      };

      const qualityResult = qualityEngine.runQualityChecks(context);
      if (!qualityResult.passed) {
        const failedChecks = qualityResult.checks.filter(c => !c.passed);
        if (failedChecks.length > 0) {
          console.log(`[claude-opt-pro] Quality check: ${failedChecks.length} issue(s) detected`);
        }
      }
    }
  }

  const contextUsage = await costEngine.checkContextUsage();
  if (contextUsage) {
    const taskComplexity = 0.5;

    if (builtinCoordinator.shouldCompact(contextUsage.percentage, taskComplexity)) {
      console.log(`[claude-opt-pro] Context at ${contextUsage.percentage}%. Consider running /compact to free space.`);
      state.suggestions.push({
        type: 'compact',
        message: `Context at ${contextUsage.percentage}%. Run /compact to free space.`,
        timestamp: new Date().toISOString()
      });
    }

    if (builtinCoordinator.shouldCompress(contextUsage.percentage)) {
      console.log(`[claude-opt-pro] Context at ${contextUsage.percentage}%. Consider running /compress.`);
      state.suggestions.push({
        type: 'compress',
        message: `Context at ${contextUsage.percentage}%. Run /compress to compress context.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  saveState(state);
  process.exit(0);
}

main().catch(err => {
  console.error('[claude-opt-pro] PreToolUse hook error:', err.message);
  process.exit(0);
});
