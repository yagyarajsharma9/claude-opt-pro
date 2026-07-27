class BaseAgentAdapter {
  constructor(agentName, configDir) {
    this.agentName = agentName;
    this.configDir = configDir;
    this.supported = true;
  }

  getModelCommand(modelName) {
    throw new Error('getModelCommand must be implemented by subclass');
  }

  getModelSwitchInstruction(modelName) {
    throw new Error('getModelSwitchInstruction must be implemented by subclass');
  }

  getConfigFiles() {
    return [];
  }

  canAutoSwitch() {
    return false;
  }

  getAutoSwitchCommand(modelName) {
    return null;
  }
}

class ClaudeCodeAdapter extends BaseAgentAdapter {
  constructor() {
    super('claude', '.claude');
  }

  canAutoSwitch() {
    return true;
  }

  getModelCommand(modelName) {
    return `/model ${modelName}`;
  }

  getModelSwitchInstruction(modelName) {
    return `Use the /model command to switch to ${modelName}. Alternatively, set the model in settings.json with "model": "${modelName}".`;
  }

  getAutoSwitchCommand(modelName) {
    return { command: 'claude', args: ['--model', modelName] };
  }

  getConfigFiles() {
    return ['.claude/settings.json', '.claude/settings.local.json', 'CLAUDE.md'];
  }

  getHookCode(modelName) {
    return `
// Auto-switch model for ${modelName}
// Add to .claude/settings.json hooks:
// {
//   "hooks": {
//     "SessionStart": [
//       {
//         "matcher": "",
//         "hooks": [
//           {
//             "type": "command",
//             "command": "claude --model ${modelName}"
//           }
//         ]
//       }
//     ]
//   }
// }
`;
  }
}

class OpenCodeAdapter extends BaseAgentAdapter {
  constructor() {
    super('opencode', '.opencode');
  }

  canAutoSwitch() {
    return true;
  }

  getModelCommand(modelName) {
    return `/model ${modelName}`;
  }

  getModelSwitchInstruction(modelName) {
    return `Use /model ${modelName} to switch models. OpenCode supports programmatic model switching via plugin API.`;
  }

  getAutoSwitchCommand(modelName) {
    return { command: 'opencode', args: ['--model', modelName] };
  }

  getPluginCode(modelName) {
    return `
// opencode-plugin.js
module.exports = {
  name: 'claude-opt-pro-model-router',
  hooks: {
    'tool.execute.before': async (context) => {
      const complexity = assessComplexity(context);
      const model = complexity < 0.3 ? 'haiku' : complexity > 0.7 ? '${modelName}' : 'sonnet';
      context.options.model = model;
      return context;
    }
  }
};

function assessComplexity(context) {
  const filesChanged = context.files?.length || 0;
  const hasTests = context.task?.includes('test') || false;
  const isConfig = context.task?.includes('config') || false;
  if (isConfig) return 0.1;
  if (filesChanged > 10) return 0.9;
  if (hasTests && !isConfig) return 0.6;
  return 0.4;
}
`;
  }

  getConfigFiles() {
    return ['.opencode/opencode.json', 'AGENTS.md', '.opencode/CLAUDE.md'];
  }
}

class CursorAdapter extends BaseAgentAdapter {
  constructor() {
    super('cursor', '.cursor');
  }

  canAutoSwitch() {
    false;
  }

  getModelCommand(modelName) {
    return null;
  }

  getModelSwitchInstruction(modelName) {
    return `Cursor does not support programmatic model switching. Please use Ctrl+Shift+P → "Cursor: Configure Model" to select ${modelName}. Update .cursor/rules/claude-opt-pro.mdc with your model preference.`;
  }

  getConfigFiles() {
    return ['.cursor/rules/claude-opt-pro.mdc', '.cursor/rules/', '.cursorrules'];
  }

  getRuleFileContent(modelName) {
    return `
---
description: Model routing preference for claude-opt-pro
globs:
  - "**/*"
---

# Model Preference
Preferred model: ${modelName}

# Agent-Specific Rules
- Use ${modelName} for all coding tasks
- For simple tasks, use the most efficient model available
- For complex tasks, ensure ${modelName} is used

# Model Routing
When deciding which model to use:
1. Simple formatting/renaming → use the fastest model
2. Standard coding tasks → use ${modelName}
3. Complex architecture/debugging → use ${modelName}
`;
  }
}

class CodexAdapter extends BaseAgentAdapter {
  constructor() {
    super('codex', '.github');
  }

  canAutoSwitch() {
    false;
  }

  getModelCommand(modelName) {
    return null;
  }

  getModelSwitchInstruction(modelName) {
    return `Codex uses AGENTS.md for instructions. Add "Model: ${modelName}" to .github/copilot-instructions.md or AGENTS.md for model preference.`;
  }

  getConfigFiles() {
    return ['AGENTS.md', '.github/copilot-instructions.md', '.codex/'];
  }

  getInstructionsContent(modelName) {
    return `
# Model Preference
Preferred model: ${modelName}

# Optimization
- Use ${modelName} as the primary model
- For simple tasks, prefer lighter models when available
- For complex tasks, use ${modelName} for full reasoning capability
`;
  }
}

class GeminiCLIAdapter extends BaseAgentAdapter {
  constructor() {
    super('gemini', '.gemini');
  }

  canAutoSwitch() {
    false;
  }

  getModelCommand(modelName) {
    return null;
  }

  getModelSwitchInstruction(modelName) {
    return `Gemini CLI supports model selection via --model flag. Use "gemini --model ${modelName}" for specific tasks.`;
  }

  getConfigFiles() {
    return ['AGENTS.md', '.gemini/', 'GEMINI.md'];
  }

  getInstructionsContent(modelName) {
    return `
# Model Preference
Preferred model: ${modelName}

# Model Routing
When working on this project, use ${modelName} as the primary model.
For simple tasks, switch to faster models when available.
`;
  }
}

class WindsurfAdapter extends BaseAgentAdapter {
  constructor() {
    super('windsurf', '.windsurf');
  }

  canAutoSwitch() {
    false;
  }

  getModelSwitchInstruction(modelName) {
    return `Windsurf uses .windsurfrules for project rules. Add model preference there. Windsurf's model control is limited; use the UI to select ${modelName}.`;
  }

  getConfigFiles() {
    return ['.windsurfrules', '.windsurf/'];
  }
}

class ClineAdapter extends BaseAgentAdapter {
  constructor() {
    super('cline', '.cline');
  }

  canAutoSwitch() {
    false;
  }

  getModelSwitchInstruction(modelName) {
    return `Cline uses .clinerules for instructions. Add model preference there.`;
  }

  getConfigFiles() {
    return ['.clinerules', '.clinerules.md'];
  }
}

class GenericAdapter extends BaseAgentAdapter {
  constructor() {
    super('generic', null);
    this.supported = false;
  }

  canAutoSwitch() {
    return false;
  }

  getModelSwitchInstruction() {
    return 'This agent does not support programmatic model switching. Please configure your model manually in the agent settings.';
  }
}

const AGENTS = {
  claude: { name: 'Claude Code', adapter: ClaudeCodeAdapter },
  opencode: { name: 'OpenCode', adapter: OpenCodeAdapter },
  cursor: { name: 'Cursor', adapter: CursorAdapter },
  codex: { name: 'Codex', adapter: CodexAdapter },
  gemini: { name: 'Gemini CLI', adapter: GeminiCLIAdapter },
  windsurf: { name: 'Windsurf', adapter: WindsurfAdapter },
  cline: { name: 'Cline', adapter: ClineAdapter },
};

function getAgentAdapter(agentKey) {
  const agent = AGENTS[agentKey];
  if (!agent) {
    return new GenericAdapter();
  }
  return new agent.adapter();
}

function detectAgent() {
  const indicators = {
    claude: ['CLAUDE_CODE', 'claude', '.claude'],
    cursor: ['CURSOR', '.cursor', '.cursorrules'],
    codex: ['CODEx', '.codex', '.github/copilot'],
    gemini: ['GEMINI_CLI', 'gemini', '.gemini', 'AGENTS.md'],
    windsurf: ['WINDSURF', '.windsurf', '.windsurfrules'],
    opencode: ['OPENCODE', '.opencode', 'opencode.json'],
    cline: ['CLINE', '.cline', '.clinerules'],
  };

  try {
    const fs = require('fs');
    const path = require('path');
    const cwd = process.cwd();

    for (const [agent, indicators_list] of Object.entries(indicators)) {
      for (const indicator of indicators_list) {
        if (indicator.startsWith('.')) {
          const checkPath = path.join(cwd, indicator);
          if (fs.existsSync(checkPath)) {
            return agent;
          }
        } else if (process.env[indicator]) {
          return agent;
        }
      }
    }
  } catch (e) {}

  return 'claude';
}

module.exports = {
  getAgentAdapter,
  detectAgent,
  AGENTS,
  BaseAgentAdapter,
  ClaudeCodeAdapter,
  OpenCodeAdapter,
  CursorAdapter,
  CodexAdapter,
  GeminiCLIAdapter,
  WindsurfAdapter,
  ClineAdapter,
  GenericAdapter,
};