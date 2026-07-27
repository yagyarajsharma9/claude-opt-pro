const fs = require('fs');
const path = require('path');
const ConfigManager = require('../config-manager');

const AGENTS = {
  claude: { name: 'Claude Code', detect: 'claude', configDir: '.claude' },
  cursor: { name: 'Cursor', detect: 'cursor', configDir: '.cursor' },
  codex: { name: 'Codex', detect: 'codex', configDir: '.codex' },
  gemini: { name: 'Gemini CLI', detect: 'gemini', configDir: '.gemini' },
  windsurf: { name: 'Windsurf', detect: 'windsurf', configDir: '.windsurf' },
  copilot: { name: 'GitHub Copilot', detect: 'copilot', configDir: '.github' },
  cline: { name: 'Cline', detect: 'cline', configDir: '.cline' },
  opencode: { name: 'OpenCode', detect: 'opencode', configDir: '.opencode' },
  unknown: { name: 'Unknown', detect: null, configDir: null }
};

class SetupWizard {
  constructor(configManager) {
    this.configManager = configManager;
    this.currentAgent = this.detectAgent();
    this.pluginDir = path.resolve(__dirname, '..', '..');
  }

  detectAgent() {
    const envVariables = {
      CLAUDE_CODE: process.env.CLAUDE_CODE,
      CURSOR: process.env.CURSOR,
      CODEx: process.env.CODEx,
      GEMINI_CLI: process.env.GEMINI_CLI,
      WINDSURF: process.env.WINDSURF,
      COPILOT: process.env.COPILOT,
      CLINE: process.env.CLINE,
      OPENCODE: process.env.OPENCODE
    };

    for (const [agent, config] of Object.entries(AGENTS)) {
      if (agent === 'unknown') continue;
      if (envVariables[agent.toUpperCase()]) return agent;
      if (config.detect && process.env[config.detect.toUpperCase()]) return agent;
    }

    try {
      const procTitle = process.title || '';
      for (const [agent, config] of Object.entries(AGENTS)) {
        if (agent === 'unknown') continue;
        if (procTitle.toLowerCase().includes(agent)) return agent;
      }
    } catch (e) {}

    return 'claude';
  }

  isFreshInstall() {
    const userConfigPath = path.join(this.pluginDir, 'config', 'user-config.json');
    if (!fs.existsSync(userConfigPath)) return true;

    try {
      const config = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
      return !config.setupComplete;
    } catch (e) {
      return true;
    }
  }

  runSetup() {
    const wizard = {
      steps: [],
      currentStep: 0,
      completed: false,
      agent: this.currentAgent,
      agentName: AGENTS[this.currentAgent]?.name || 'Unknown',
      responses: {}
    };

    wizard.steps = this.getSetupSteps();
    return wizard;
  }

  getSetupSteps() {
    return [
      {
        id: 'welcome',
        title: 'Welcome to Claude Optimizer Pro',
        description: 'One-time setup to configure your optimization preferences.',
        type: 'info',
        options: null
      },
      {
        id: 'agent_detected',
        title: 'Detected Agent',
        description: `We detected ${AGENTS[this.currentAgent]?.name || 'your coding agent'}. Configuration will be tailored for this agent.`,
        type: 'info',
        options: null
      },
      {
        id: 'model_selection',
        title: 'Select Your Preferred Model (Ceiling)',
        description: 'This is your MAXIMUM model. The plugin will auto-select cheaper models for simple tasks, saving you money. For example: if you pick Opus, simple tasks use Haiku and medium tasks use Sonnet.',
        type: 'choice',
        options: [
          { value: 'opus', label: 'Opus', description: 'Premium tier. Auto-routes: Haiku (simple), Sonnet (medium), Opus (complex). Best for complex projects.' },
          { value: 'sonnet', label: 'Sonnet', description: 'Standard tier. Auto-routes: Haiku (simple), Sonnet (medium+complex). Best balance of cost and quality.' },
          { value: 'haiku', label: 'Haiku', description: 'Fast tier. All tasks use Haiku. Maximum savings, minimum quality tradeoff.' }
        ]
      },
      {
        id: 'integrations',
        title: 'Select Integrations',
        description: 'Which optimization tools would you like to enable?',
        type: 'multi-choice',
        options: [
          { value: 'rtk', label: 'RTK', description: 'Bash output compression (60-90% reduction). Requires rtk binary.' },
          { value: 'caveman', label: 'Caveman', description: 'Output verbosity control (65% reduction). Requires caveman plugin.' },
          { value: 'codegraph', label: 'CodeGraph', description: 'Semantic code understanding (60% lower cost). Requires codegraph CLI.' },
          { value: 'claude_mem', label: 'Claude Mem', description: 'Persistent context across sessions. Requires claude-mem npm package.' },
          { value: 'superpower', label: 'Superpower', description: 'TDD methodology and systematic debugging. Requires superpower plugin.' },
          { value: 'cost_optimizer', label: 'Cost Optimizer', description: 'Mode-based cost reduction (30-60% savings). Requires cost-optimizer plugin.' }
        ]
      },
      {
        id: 'budget',
        title: 'Monthly Budget',
        description: 'Set your monthly cost budget for Claude Code optimization:',
        type: 'input',
        default: '$50',
        validation: (input) => {
          const num = parseFloat(input.replace(/[$.]/g, ''));
          return !isNaN(num) && num > 0;
        }
      },
      {
        id: 'complete',
        title: 'Setup Complete',
        description: 'Your configuration has been saved. Run /opt-dashboard to view metrics or /opt-config to change settings anytime.',
        type: 'info',
        options: null
      }
    ];
  }

  saveSetup(responses) {
    const config = this.configManager.getMergedConfig();
    const mode = responses.mode || 'balanced';
    const preferredModel = responses.preferred_model || 'opus';

    const tierModelMap = {
      fast: responses.preferred_haiku || 'haiku',
      standard: responses.preferred_sonnet || 'sonnet',
      premium: responses.preferred_opus || 'opus'
    };

    const newConfig = {
      setupComplete: true,
      setupDate: new Date().toISOString(),
      agent: this.currentAgent,
      agentName: AGENTS[this.currentAgent]?.name || 'Unknown',
      mode: mode,
      modelRouting: true,
      preferred_model: preferredModel,
      preferred_haiku: tierModelMap.fast,
      preferred_sonnet: tierModelMap.standard,
      preferred_opus: tierModelMap.premium,
      integrations: {},
      budget: responses.budget || '$50',
      preferences: {
        defaultModel: preferredModel,
        ceilingTier: this.configManager ? this.getModelTier(preferredModel) : 'premium',
        autoSwitch: true,
        qualityThreshold: 0.5,
        costThreshold: 0.5
      }
    };

    for (const integration of responses.integrations || []) {
      newConfig.integrations[integration] = { enabled: true, auto_install: true };
    }

    if (!newConfig.integrations.rtk) newConfig.integrations.rtk = { enabled: false, auto_install: false };
    if (!newConfig.integrations.caveman) newConfig.integrations.caveman = { enabled: false, auto_install: false };
    if (!newConfig.integrations.codegraph) newConfig.integrations.codegraph = { enabled: false, auto_install: false };
    if (!newConfig.integrations.claude_mem) newConfig.integrations.claude_mem = { enabled: true, auto_install: true };
    if (!newConfig.integrations.superpower) newConfig.integrations.superpower = { enabled: false, auto_install: false };
    if (!newConfig.integrations.cost_optimizer) newConfig.integrations.cost_optimizer = { enabled: false, auto_install: false };

    const configPath = path.join(this.pluginDir, 'config', 'user-config.json');
    try {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
      this.configManager.userConfig = newConfig;
      return { success: true, config: newConfig };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getModelTier(modelName) {
    const tiers = {
      haiku: { tier: 'fast', models: ['haiku', 'haiku-4.5', 'claude-haiku'], default: 'haiku' },
      sonnet: { tier: 'standard', models: ['sonnet', 'sonnet-5', 'claude-sonnet'], default: 'sonnet' },
      opus: { tier: 'premium', models: ['opus', 'opus-5', 'claude-opus'], default: 'opus' }
    };

    const lower = (modelName || '').toLowerCase();
    for (const [tier, info] of Object.entries(tiers)) {
      for (const model of info.models) {
        if (lower.includes(model)) return tier;
      }
    }
    return 'standard';
  }

  resolveModelName(alias) {
    const modelMap = {
      haiku: 'haiku',
      sonnet: 'sonnet',
      opus: 'opus',
      'haiku-4.5': 'haiku',
      'sonnet-5': 'sonnet',
      'opus-5': 'opus',
      'claude-haiku': 'haiku',
      'claude-sonnet': 'sonnet',
      'claude-opus': 'opus',
      'fable': 'opus',
      'fable-5': 'opus'
    };

    return modelMap[(alias || '').toLowerCase()] || alias || 'sonnet';
  }

  getAutoModelForComplexity(complexity, taskType) {
    const config = this.configManager.getCostConfig();
    if (!config.model_routing) return null;

    if (complexity < 0.3 || taskType === 'simple') {
      return this.resolveModelName(config.preferred_haiku) || 'haiku';
    }
    if (complexity > 0.7 || taskType === 'complex') {
      return this.resolveModelName(config.preferred_opus) || 'opus';
    }
    return this.resolveModelName(config.preferred_sonnet) || 'sonnet';
  }

  getSetupStatus() {
    const userConfigPath = path.join(this.pluginDir, 'config', 'user-config.json');
    if (!fs.existsSync(userConfigPath)) {
      return { setupComplete: false, needsSetup: true, agent: this.currentAgent };
    }

    try {
      const config = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
      return {
        setupComplete: config.setupComplete || false,
        needsSetup: !(config.setupComplete),
        agent: config.agent || this.currentAgent,
        mode: config.mode || 'balanced',
        modelRouting: config.modelRouting !== false,
        budget: config.budget || '$50',
        integrations: config.integrations || {}
      };
    } catch (e) {
      return { setupComplete: false, needsSetup: true, agent: this.currentAgent };
    }
  }
}

module.exports = SetupWizard;
