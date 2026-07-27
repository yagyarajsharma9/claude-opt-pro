const ConfigManager = require('./config-manager');

class QualityEngine {
  constructor(configManager) {
    this.configManager = configManager;
    this.qualityMetrics = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      suggestions: [],
      bugRate: 0,
      testCoverage: 0,
      karpathyCompliance: 0
    };
  }

  getKarpathyPrinciples() {
    return [
      {
        id: 'think-before-coding',
        name: 'Think Before Coding',
        description: 'Address wrong assumptions, hidden confusion, missing tradeoffs',
        check: this.checkThinkBeforeCoding.bind(this)
      },
      {
        id: 'simplicity-first',
        name: 'Simplicity First',
        description: 'Avoid overcomplication, bloated abstractions',
        check: this.checkSimplicityFirst.bind(this)
      },
      {
        id: 'surgical-changes',
        name: 'Surgical Changes',
        description: 'Make orthogonal edits, don\'t touch unrelated code',
        check: this.checkSurgicalChanges.bind(this)
      },
      {
        id: 'goal-driven',
        name: 'Goal-Driven Execution',
        description: 'Tests-first, verifiable success criteria',
        check: this.checkGoalDriven.bind(this)
      }
    ];
  }

  checkThinkBeforeCoding(context) {
    const issues = [];
    if (context.hasAssumptions && context.assumptions.length > 0) {
      issues.push({
        severity: 'warning',
        message: 'Potential unverified assumptions detected',
        details: context.assumptions
      });
    }
    return { passed: issues.length === 0, issues };
  }

  checkSimplicityFirst(context) {
    const issues = [];
    if (context.complexity && context.complexity > this.configManager.getQualityConfig().max_complexity) {
      issues.push({
        severity: 'warning',
        message: `Code complexity (${context.complexity}) exceeds max (${this.configManager.getQualityConfig().max_complexity})`,
        suggestion: 'Consider breaking into smaller functions'
      });
    }
    return { passed: issues.length === 0, issues };
  }

  checkSurgicalChanges(context) {
    const issues = [];
    if (context.filesChanged && context.filesChanged.length > 5) {
      issues.push({
        severity: 'warning',
        message: `Large number of files changed (${context.filesChanged.length})`,
        suggestion: 'Consider smaller, more focused changes'
      });
    }
    return { passed: issues.length === 0, issues };
  }

  checkGoalDriven(context) {
    const issues = [];
    if (!context.hasTests && context.isNewFeature) {
      issues.push({
        severity: 'error',
        message: 'New feature without tests',
        suggestion: 'Add tests before implementation'
      });
    }
    return { passed: issues.length === 0, issues };
  }

  runQualityChecks(context) {
    const config = this.configManager.getQualityConfig();
    if (!config.karpathy_principles) {
      return { passed: true, checks: [] };
    }

    const principles = this.getKarpathyPrinciples();
    const results = principles.map(p => ({
      principle: p.id,
      name: p.name,
      ...p.check(context)
    }));

    this.qualityMetrics.totalChecks += results.length;
    results.forEach(r => {
      if (r.passed) {
        this.qualityMetrics.passedChecks++;
      } else {
        this.qualityMetrics.failedChecks++;
      }
    });

    const compliance = (this.qualityMetrics.passedChecks / this.qualityMetrics.totalChecks) * 100;
    this.qualityMetrics.karpathyCompliance = Math.round(compliance);

    return {
      passed: results.every(r => r.passed),
      checks: results,
      compliance: this.qualityMetrics.karpathyCompliance
    };
  }

  getQualityMetrics() {
    return this.qualityMetrics;
  }

  suggestCostOptimization(context) {
    const suggestions = [];
    const config = this.configManager.getCostConfig();

    if (context.model === 'opus' && context.complexity < 0.3) {
      suggestions.push({
        type: 'model_routing',
        message: 'Consider using Haiku for this simple task',
        command: '/model haiku',
        savings: '~80%'
      });
    }

    const filesToRead = context.filesToRead;
    const fileCount = Array.isArray(filesToRead) ? filesToRead.length : (typeof filesToRead === 'number' ? filesToRead : 0);

    if (fileCount > 3) {
      suggestions.push({
        type: 'tool_usage',
        message: 'Consider using CodeGraph for semantic search instead of reading multiple files',
        command: '/codegraph explore',
        savings: '~50% tokens'
      });
    }

    if (context.outputLength && context.outputLength > 1000) {
      suggestions.push({
        type: 'verbosity',
        message: 'Output is verbose, consider Caveman mode',
        command: '/caveman lite',
        savings: '~40% output tokens'
      });
    }

    return suggestions;
  }
}

module.exports = QualityEngine;
