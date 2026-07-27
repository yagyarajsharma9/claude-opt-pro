const { execSync } = require('child_process');
const ConfigManager = require('./config-manager');

class BuiltinCoordinator {
  constructor(configManager) {
    this.configManager = configManager;
    this.lastCompact = 0;
    this.lastClear = 0;
    this.lastCompress = 0;
    this.lastInit = 0;
    this.taskStack = [];
    this.lastTask = null;
  }

  shouldCompact(contextUsage, taskComplexity) {
    const config = this.configManager.getCostConfig();
    if (!config.auto_compact_threshold) return false;
    if (contextUsage < config.auto_compact_threshold) return false;
    if (taskComplexity > 0.7) return false;
    const now = Date.now();
    if (now - this.lastCompact < 30000) return false;
    return true;
  }

  shouldClear(newTask, oldTask) {
    const config = this.configManager.getCostConfig();
    if (!config.auto_clear_on_task_switch) return false;
    if (!oldTask || !newTask) return false;
    if (this.areTasksRelated(newTask, oldTask)) return false;
    const now = Date.now();
    if (now - this.lastClear < 10000) return false;
    return true;
  }

  shouldCompress(contextUsage) {
    const config = this.configManager.getCostConfig();
    if (!config.auto_compress_threshold) return false;
    if (contextUsage < config.auto_compress_threshold) return false;
    const now = Date.now();
    if (now - this.lastCompress < 60000) return false;
    return true;
  }

  shouldInit(projectPath) {
    const config = this.configManager.getBuiltinCommands();
    if (!config.auto_init) return false;
    const claudeMdPath = require('path').join(projectPath, 'CLAUDE.md');
    try {
      require('fs').accessSync(claudeMdPath);
      return false;
    } catch (e) {
      return true;
    }
  }

  areTasksRelated(task1, task2) {
    const keywords1 = this.extractKeywords(task1);
    const keywords2 = this.extractKeywords(task2);
    const overlap = keywords1.filter(k => keywords2.includes(k));
    return overlap.length > 0;
  }

  extractKeywords(task) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return task.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
  }

  triggerCompact(focusInstructions = '') {
    this.lastCompact = Date.now();
    const command = focusInstructions ? `/compact ${focusInstructions}` : '/compact';
    return { triggered: true, command, timestamp: new Date().toISOString() };
  }

  triggerClear() {
    this.lastClear = Date.now();
    this.lastTask = null;
    return { triggered: true, command: '/clear', timestamp: new Date().toISOString() };
  }

  triggerCompress() {
    this.lastCompress = Date.now();
    return { triggered: true, command: '/compress', timestamp: new Date().toISOString() };
  }

  triggerInit(projectPath) {
    this.lastInit = Date.now();
    return { triggered: true, command: '/init', projectPath, timestamp: new Date().toISOString() };
  }

  recordTask(task) {
    if (this.lastTask) {
      this.taskStack.push(this.lastTask);
      if (this.taskStack.length > 10) {
        this.taskStack.shift();
      }
    }
    this.lastTask = task;
  }

  getCoordinationStats() {
    return {
      lastCompact: this.lastCompact,
      lastClear: this.lastClear,
      lastCompress: this.lastCompress,
      lastInit: this.lastInit,
      taskHistory: this.taskStack,
      currentTask: this.lastTask
    };
  }
}

module.exports = BuiltinCoordinator;
