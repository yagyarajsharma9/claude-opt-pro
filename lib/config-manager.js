const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(PLUGIN_DIR, 'config');
const DEFAULT_CONFIG_PATH = path.join(CONFIG_DIR, 'default-config.json');
const MODES_PATH = path.join(CONFIG_DIR, 'modes.json');
const USER_CONFIG_PATH = path.join(PLUGIN_DIR, 'config', 'user-config.json');

class ConfigManager {
  constructor() {
    this.defaultConfig = this.loadDefaultConfig();
    this.modes = this.loadModes();
    this.userConfig = this.loadUserConfig();
    this.currentMode = this.userConfig.mode || 'balanced';
  }

  loadDefaultConfig() {
    try {
      return JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.error('Failed to load default config:', e.message);
      return {};
    }
  }

  loadModes() {
    try {
      return JSON.parse(fs.readFileSync(MODES_PATH, 'utf8'));
    } catch (e) {
      console.error('Failed to load modes:', e.message);
      return { modes: {} };
    }
  }

  loadUserConfig() {
    try {
      return JSON.parse(fs.readFileSync(USER_CONFIG_PATH, 'utf8'));
    } catch (e) {
      return { mode: 'balanced' };
    }
  }

  saveUserConfig(config) {
    try {
      fs.mkdirSync(path.dirname(USER_CONFIG_PATH), { recursive: true });
      fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(config, null, 2));
      this.userConfig = config;
      return true;
    } catch (e) {
      console.error('Failed to save user config:', e.message);
      return false;
    }
  }

  getCurrentMode() {
    return this.currentMode;
  }

  setMode(modeName) {
    if (!this.modes.modes[modeName]) {
      throw new Error(`Unknown mode: ${modeName}`);
    }
    this.userConfig.mode = modeName;
    this.currentMode = modeName;
    this.saveUserConfig(this.userConfig);
    return this.getMergedConfig();
  }

  getModeConfig(modeName = null) {
    const mode = modeName || this.currentMode;
    return this.modes.modes[mode] || {};
  }

  getMergedConfig() {
    const modeConfig = this.getModeConfig();
    const defaultConfig = this.defaultConfig;

    return {
      mode: this.currentMode,
      quality: { ...defaultConfig.quality, ...modeConfig.quality },
      cost: { ...defaultConfig.cost, ...modeConfig.cost },
      integrations: { ...defaultConfig.integrations, ...modeConfig.integrations },
      builtin_commands: { ...defaultConfig.builtin_commands, ...modeConfig.builtin_commands },
      metrics: { ...defaultConfig.metrics, ...modeConfig.metrics }
    };
  }

  getQualityConfig() {
    return this.getMergedConfig().quality;
  }

  getCostConfig() {
    return this.getMergedConfig().cost;
  }

  getIntegrations() {
    return this.getMergedConfig().integrations;
  }

  getBuiltinCommands() {
    return this.getMergedConfig().builtin_commands;
  }

  getMetricsConfig() {
    return this.getMergedConfig().metrics;
  }

  updateConfig(updates) {
    const current = this.getMergedConfig();
    const updated = { ...current, ...updates };
    this.userConfig = { ...this.userConfig, ...updated };
    this.saveUserConfig(this.userConfig);
    return updated;
  }

  resetToDefault() {
    this.userConfig = { mode: 'balanced' };
    this.saveUserConfig(this.userConfig);
    this.currentMode = 'balanced';
    return this.getMergedConfig();
  }
}

module.exports = ConfigManager;
