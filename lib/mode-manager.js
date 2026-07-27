const ConfigManager = require('./config-manager');

class ModeManager {
  constructor(configManager) {
    this.configManager = configManager;
  }

  listModes() {
    const modes = this.configManager.modes.modes;
    return Object.entries(modes).map(([key, mode]) => ({
      key,
      name: mode.name,
      description: mode.description,
      current: key === this.configManager.getCurrentMode()
    }));
  }

  getCurrentMode() {
    return this.configManager.getCurrentMode();
  }

  switchMode(modeName) {
    try {
      const config = this.configManager.setMode(modeName);
      return {
        success: true,
        mode: modeName,
        config: config,
        message: `Switched to ${config.quality ? config.quality.name || modeName : modeName} mode`
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
        available: this.listModes().map(m => m.key)
      };
    }
  }

  getModeDetails(modeName = null) {
    const mode = modeName || this.configManager.getCurrentMode();
    const modeConfig = this.configManager.getModeConfig(mode);
    const modes = this.configManager.modes.modes;

    if (!modes[mode]) {
      return null;
    }

    return {
      key: mode,
      name: modes[mode].name,
      description: modes[mode].description,
      quality: modeConfig.quality,
      cost: modeConfig.cost,
      integrations: modeConfig.integrations,
      current: mode === this.configManager.getCurrentMode()
    };
  }

  getModeRecommendations() {
    const currentMode = this.configManager.getCurrentMode();
    const config = this.configManager.getMergedConfig();

    const recommendations = [];

    if (currentMode === 'balanced') {
      recommendations.push({
        mode: 'quality',
        reason: 'High bug rate detected',
        condition: 'bug_rate > 5%'
      });
      recommendations.push({
        mode: 'cost',
        reason: 'Low complexity task',
        condition: 'task_complexity < 0.3'
      });
    }

    if (config.cost.budget_limit && config.cost.budget_limit < 30) {
      recommendations.push({
        mode: 'cost',
        reason: 'Budget limit is low',
        condition: 'budget_limit < 30'
      });
    }

    return recommendations;
  }
}

module.exports = ModeManager;
