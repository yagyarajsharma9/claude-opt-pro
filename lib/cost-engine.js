const ConfigManager = require('./config-manager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CostEngine {
  constructor(configManager) {
    this.configManager = configManager;
    this.costMetrics = {
      totalTokensSaved: 0,
      totalCostSaved: 0,
      sessionTokens: 0,
      sessionCost: 0,
      modelRoutingDecisions: 0,
      rtkSavings: 0,
      cavemanSavings: 0,
      compactSavings: 0
    };
    this.sessionStartTokens = 0;
    this.lastContextCheck = 0;
    this.autoRoutingLog = [];
  }

  async checkRTKIntegration() {
    const config = this.configManager.getIntegrations().rtk;
    if (!config.enabled) return { available: false, message: 'RTK integration disabled' };

    try {
      const version = execSync('rtk --version 2>/dev/null || echo "not-installed"', { encoding: 'utf8' }).trim();
      if (version === 'not-installed') {
        return { available: false, message: 'RTK not installed', install: 'rtk init -g' };
      }
      return { available: true, version, message: 'RTK ready' };
    } catch (e) {
      return { available: false, message: 'RTK not available', error: e.message };
    }
  }

  async checkCavemanIntegration() {
    const config = this.configManager.getIntegrations().caveman;
    if (!config.enabled) return { available: false, message: 'Caveman integration disabled' };

    try {
      const result = execSync('claude plugin list 2>/dev/null || echo "not-installed"', { encoding: 'utf8' });
      const hasCaveman = result.includes('caveman');
      if (!hasCaveman) {
        return { available: false, message: 'Caveman not installed', install: 'claude plugin install caveman@caveman' };
      }
      return { available: true, message: 'Caveman ready', mode: config.mode };
    } catch (e) {
      return { available: false, message: 'Caveman not available', error: e.message };
    }
  }

  async checkCodeGraphIntegration() {
    const config = this.configManager.getIntegrations().codegraph;
    if (!config.enabled) return { available: false, message: 'CodeGraph integration disabled' };

    try {
      const result = execSync('codegraph status 2>/dev/null || echo "not-installed"', { encoding: 'utf8' });
      if (result.includes('not-installed')) {
        return { available: false, message: 'CodeGraph not installed', install: 'codegraph install' };
      }
      return { available: true, message: 'CodeGraph ready' };
    } catch (e) {
      return { available: false, message: 'CodeGraph not available', error: e.message };
    }
  }

  async checkAllIntegrations() {
    return {
      rtk: await this.checkRTKIntegration(),
      caveman: await this.checkCavemanIntegration(),
      codegraph: await this.checkCodeGraphIntegration()
    };
  }

  async installIntegration(name) {
    const configs = {
      rtk: () => 'rtk init -g',
      caveman: () => 'claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman',
      codegraph: () => 'codegraph install',
      claude_mem: () => 'npx claude-mem install',
      cost_optimizer: () => 'claude plugin marketplace add Sagargupta16/claude-cost-optimizer && claude plugin install cost-mode@claude-cost-optimizer',
      superpower: () => 'claude plugin marketplace add obra/superpowers && claude plugin install superpowers@superpowers-marketplace'
    };

    const command = configs[name];
    if (!command) {
      return { success: false, error: `Unknown integration: ${name}` };
    }

    try {
      execSync(command(), { encoding: 'utf8', stdio: 'pipe' });
      return { success: true, message: `${name} installed successfully` };
    } catch (e) {
      return { success: false, error: e.message, command: command() };
    }
  }

  async installAllIntegrations() {
    const integrations = this.configManager.getIntegrations();
    const results = {};

    for (const [name, config] of Object.entries(integrations)) {
      if (config.enabled && config.auto_install) {
        results[name] = await this.installIntegration(name);
      }
    }

    return results;
  }

  getModelRoutingSuggestion(complexity, taskType) {
    const config = this.configManager.getCostConfig();
    if (!config.model_routing) return null;

    const threshold = config.suggest_haiku_threshold || 500;

    if (complexity < 0.3 || (taskType === 'simple' && complexity < 0.5)) {
      return {
        model: 'haiku',
        reason: 'Simple task detected',
        savings: '~80%',
        command: '/model haiku'
      };
    }

    if (complexity > 0.7 || taskType === 'complex') {
      return {
        model: 'opus',
        reason: 'Complex task detected',
        command: '/model opus'
      };
    }

    return {
      model: 'sonnet',
      reason: 'Standard task',
      command: '/model sonnet'
    };
  }

  autoRouteModel(context) {
    const config = this.configManager.getCostConfig();
    if (!config.model_routing) return null;

    const complexity = this.assessComplexity(context);
    const taskType = this.classifyTask(context);
    const model = this.selectModel(complexity, taskType);
    const routingSavings = this.calculateSavings(model, complexity);

    this.costMetrics.modelRoutingDecisions++;

    const result = {
      model: model.model,
      reason: model.reason,
      complexity,
      taskType,
      savings: routingSavings,
      autonomous: true,
      timestamp: new Date().toISOString()
    };

    if (!this.autoRoutingLog) this.autoRoutingLog = [];
    this.autoRoutingLog.push(result);
    this.recordSavings('model_routing', routingSavings.tokens);

    return result;
  }

  assessComplexity(context) {
    let score = 0.5;

    if (context.filesChanged) {
      const fileCount = Array.isArray(context.filesChanged) ? context.filesChanged.length : context.filesChanged;
      if (fileCount > 10) score += 0.3;
      else if (fileCount > 5) score += 0.2;
      else if (fileCount > 2) score += 0.1;
    }

    if (context.linesChanged) {
      if (context.linesChanged > 500) score += 0.2;
      else if (context.linesChanged > 200) score += 0.1;
    }

    if (context.hasTests && !context.hasImplementation) score -= 0.1;
    if (context.isNewFeature) score += 0.15;
    if (context.isBugFix && context.severity === 'critical') score += 0.1;
    if (context.involvesArchitecture) score += 0.2;
    if (context.isConfigChange) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }

  classifyTask(context) {
    if (context.isConfigChange || context.isFormatting || context.isRename) return 'simple';
    if (context.hasTests && context.hasImplementation && !context.involvesArchitecture) return 'medium';
    if (context.involvesArchitecture || context.filesChanged > 10 || context.isBugFix) return 'complex';
    if (context.isBugFix) return 'medium';
    return 'medium';
  }

  selectModel(complexity, taskType) {
    if (complexity < 0.3 || taskType === 'simple') {
      return { model: 'haiku', reason: 'Auto-routed: simple task', savingsPct: 0.8 };
    }
    if (complexity > 0.7 || taskType === 'complex') {
      return { model: 'opus', reason: 'Auto-routed: complex task', savingsPct: 0 };
    }
    return { model: 'sonnet', reason: 'Auto-routed: standard task', savingsPct: 0.5 };
  }

  calculateSavings(model, complexity) {
    const baseTokens = 1000;
    const modelMultiplier = { haiku: 0.2, sonnet: 0.5, opus: 1.0 };
    const ratio = (modelMultiplier[model.model] || 0.5) / modelMultiplier.opus;
    const tokensSaved = Math.round(baseTokens * (1 - ratio) * (complexity + 0.5));
    const costSaved = tokensSaved * 0.025;
    return { tokens: tokensSaved, cost: costSaved.toFixed(4) };
  }

  getAutoRoutingLog() {
    return this.autoRoutingLog || [];
  }

  async checkContextUsage() {
    const config = this.configManager.getCostConfig();
    const now = Date.now();

    if (now - this.lastContextCheck < 5000) {
      return null;
    }
    this.lastContextCheck = now;

    try {
      const result = execSync('claude /context 2>/dev/null || echo "0"', { encoding: 'utf8' });
      const match = result.match(/(\d+(?:\.\d+)?)\s*%\s*\(/) || result.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);

      if (match) {
        const percentage = match[1] ? parseFloat(match[1]) : (parseFloat(match[1]) / parseFloat(match[2])) * 100;
        return {
          percentage: Math.round(percentage),
          threshold: config.auto_compact_threshold,
          compressThreshold: config.auto_compress_threshold,
          shouldCompact: percentage >= config.auto_compact_threshold,
          shouldCompress: percentage >= config.auto_compress_threshold
        };
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  getCostMetrics() {
    return this.costMetrics;
  }

  updateSessionTokens(tokens) {
    this.costMetrics.sessionTokens += tokens;
  }

  recordSavings(type, amount) {
    switch (type) {
      case 'rtk':
        this.costMetrics.rtkSavings += amount;
        break;
      case 'caveman':
        this.costMetrics.cavemanSavings += amount;
        break;
      case 'compact':
        this.costMetrics.compactSavings += amount;
        break;
    }
    this.costMetrics.totalTokensSaved += amount;
  }
}

module.exports = CostEngine;
