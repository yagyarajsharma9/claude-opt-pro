const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ConfigManager = require('../lib/config-manager');
const ModeManager = require('../lib/mode-manager');
const QualityEngine = require('../lib/quality-engine');
const CostEngine = require('../lib/cost-engine');
const BuiltinCoordinator = require('../lib/builtin-coordinator');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const PLUGIN_CONFIG_DIR = path.join(PLUGIN_DIR, 'config');

const tests = {
  passed: 0,
  failed: 0,
  errors: []
};

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    tests.passed++;
    console.log(`  PASS: ${message}`);
  } else {
    tests.failed++;
    tests.errors.push(`FAIL: ${message} - expected ${expected}, got ${actual}`);
    console.log(`  FAIL: ${message} - expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  try {
    assert.deepStrictEqual(actual, expected);
    tests.passed++;
    console.log(`  PASS: ${message}`);
  } catch (e) {
    tests.failed++;
    tests.errors.push(`FAIL: ${message} - ${e.message}`);
    console.log(`  FAIL: ${message} - ${e.message}`);
  }
}

function assertExists(value, message) {
  if (value !== undefined && value !== null) {
    tests.passed++;
    console.log(`  PASS: ${message}`);
  } else {
    tests.failed++;
    tests.errors.push(`FAIL: ${message}`);
    console.log(`  FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('=== Claude Optimizer Pro Test Suite ===\n');

  await testConfigManager();
  await testModeManager();
  await testQualityEngine();
  await testCostEngine();
  await testBuiltinCoordinator();
  await testPluginStructure();

  printSummary();
  process.exit(tests.failed > 0 ? 1 : 0);
}

async function testConfigManager() {
  console.log('--- Config Manager Tests ---');

  process.chdir(path.join(PLUGIN_DIR, '..', '..'));

  const cm = new ConfigManager();

  assertExists(cm.defaultConfig, 'Default config loaded');
  assertExists(cm.modes, 'Modes loaded');
  assertExists(cm.userConfig, 'User config loaded');
  assertEqual(cm.getCurrentMode(), cm.userConfig.mode || 'balanced', 'Current mode matches user config');

  const modes = cm.getModeConfig('balanced');
  assertExists(modes.name, 'Balanced mode has a name');

  const allModes = cm.modes.modes;
  assertEqual(Object.keys(allModes).length, 4, 'There are 4 modes defined (quality, balanced, cost, custom)');

  const merged = cm.getMergedConfig();
  assertEqual(merged.mode, cm.currentMode, 'Merged config has current mode');
  assertExists(merged.quality, 'Merged config has quality settings');
  assertExists(merged.cost, 'Merged config has cost settings');
  assertExists(merged.integrations, 'Merged config has integrations');

  const saved = cm.saveUserConfig({ mode: 'quality' });
  assertEqual(saved, true, 'User config saved successfully');

  const restored = new ConfigManager();
  assertEqual(restored.getCurrentMode(), 'quality', 'Mode persisted after reload');
  cm.userConfig = { mode: 'balanced' };
  cm.saveUserConfig({ mode: 'balanced' });

  const resetConfig = cm.resetToDefault();
  assertEqual(resetConfig.mode, 'balanced', 'Config reset returns to balanced mode');

  console.log('');
}

async function testModeManager() {
  console.log('--- Mode Manager Tests ---');

  const cm = new ConfigManager();
  const mm = new ModeManager(cm);

  const modes = mm.listModes();
  assertEqual(modes.length, 4, '4 modes listed');

  const qualityMode = modes.find(m => m.key === 'quality');
  assertEqual(qualityMode.current, cm.getCurrentMode() === 'quality', 'Quality mode current flag correct');

  const balancedMode = modes.find(m => m.key === 'balanced');
  assertEqual(balancedMode.current, cm.getCurrentMode() === 'balanced', 'Balanced mode current flag correct');

  const result = mm.switchMode('quality');
  assertEqual(result.success, true, 'Switch to quality mode succeeds');
  assertEqual(result.mode, 'quality', 'Switched to quality mode');

  const resetResult = mm.switchMode('balanced');
  assertEqual(resetResult.success, true, 'Switch back to balanced mode succeeds');

  const invalidResult = mm.switchMode('nonexistent');
  assertEqual(invalidResult.success, false, 'Switching to unknown mode fails');
  assertExists(invalidResult.available, 'Unknown mode returns available modes list');

  const details = mm.getModeDetails('cost');
  assertExists(details, 'Cost mode details returned');
  assertEqual(details.name, 'Cost Mode', 'Cost mode has correct name');
  assertEqual(details.integrations.caveman.mode, 'full', 'Cost mode has full caveman mode');
  assertEqual(details.integrations.rtk.aggressive, true, 'Cost mode has aggressive RTK');

  const recommendations = mm.getModeRecommendations();
  assertExists(recommendations, 'Recommendations returned');

  console.log('');
}

async function testQualityEngine() {
  console.log('--- Quality Engine Tests ---');

  const cm = new ConfigManager();
  const qe = new QualityEngine(cm);

  const principles = qe.getKarpathyPrinciples();
  assertEqual(principles.length, 4, '4 Karpathy principles defined');
  assertEqual(principles[0].id, 'think-before-coding', 'First principle is Think Before Coding');
  assertEqual(principles[1].id, 'simplicity-first', 'Second principle is Simplicity First');
  assertEqual(principles[2].id, 'surgical-changes', 'Third principle is Surgical Changes');
  assertEqual(principles[3].id, 'goal-driven', 'Fourth principle is Goal-Driven');

  const context1 = { hasAssumptions: false, complexity: 5, filesChanged: ['file1.js'], isNewFeature: false, hasTests: true };
  const result1 = qe.runQualityChecks(context1);
  assertEqual(result1.checks.length, 4, '4 quality checks run');
  assertEqual(result1.passed, true, 'Checks pass with good context');

  const context2 = { hasAssumptions: true, assumptions: ['assumption1'], complexity: 15, filesChanged: new Array(10).fill('f.js'), isNewFeature: true, hasTests: false };
  const result2 = qe.runQualityChecks(context2);
  assertEqual(result2.checks.length, 4, '4 quality checks run for bad context');
  assertEqual(result2.passed, false, 'Checks fail with bad context');
  const failedChecks = result2.checks.filter(c => !c.passed);
  assertExists(failedChecks.length > 0, 'Some checks fail');

  const suggestions = qe.suggestCostOptimization({
    model: 'opus',
    complexity: 0.2,
    filesToRead: 5,
    outputLength: 1500
  });
  assertExists(suggestions, 'Cost optimization suggestions returned');
  assertEqual(suggestions.length, 3, '3 suggestions for verbose output');

  const metrics = qe.getQualityMetrics();
  assertExists(metrics, 'Quality metrics available');
  assertExists(metrics.totalChecks, 'Total checks tracked');
  assertExists(metrics.karpathyCompliance, 'Compliance tracked');

  console.log('');
}

async function testCostEngine() {
  console.log('--- Cost Engine Tests ---');

  const cm = new ConfigManager();
  const ce = new CostEngine(cm);

  assertExists(ce.costMetrics, 'Cost metrics initialized');
  assertEqual(ce.costMetrics.totalTokensSaved, 0, 'Initial tokens saved is 0');

  ce.recordSavings('rtk', 1000);
  assertEqual(ce.costMetrics.totalTokensSaved, 1000, 'RTK savings recorded');
  assertEqual(ce.costMetrics.rtkSavings, 1000, 'RTK-specific savings recorded');

  ce.recordSavings('caveman', 500);
  assertEqual(ce.costMetrics.totalTokensSaved, 1500, 'Caveman savings added');
  assertEqual(ce.costMetrics.cavemanSavings, 500, 'Caveman-specific savings recorded');

  const modelSuggestion = ce.getModelRoutingSuggestion(0.2, 'simple');
  assertEqual(modelSuggestion.model, 'haiku', 'Simple task routes to Haiku');

  const opusSuggestion = ce.getModelRoutingSuggestion(0.8, 'complex');
  assertEqual(opusSuggestion.model, 'opus', 'Complex task routes to Opus');

  const sonnetSuggestion = ce.getModelRoutingSuggestion(0.5, 'standard');
  assertEqual(sonnetSuggestion.model, 'sonnet', 'Standard task routes to Sonnet');

  const rtkStatus = await ce.checkRTKIntegration();
  assertExists(rtkStatus, 'RTK integration check returns result');

  const cavemanStatus = await ce.checkCavemanIntegration();
  assertExists(cavemanStatus, 'Caveman integration check returns result');

  const codegraphStatus = await ce.checkCodeGraphIntegration();
  assertExists(codegraphStatus, 'CodeGraph integration check returns result');

  const allIntegrations = await ce.checkAllIntegrations();
  assertExists(allIntegrations.rtk, 'All integrations check includes RTK');
  assertExists(allIntegrations.caveman, 'All integrations check includes Caveman');
  assertExists(allIntegrations.codegraph, 'All integrations check includes CodeGraph');

  console.log('');
}

async function testBuiltinCoordinator() {
  console.log('--- Built-in Coordinator Tests ---');

  const cm = new ConfigManager();
  const bc = new BuiltinCoordinator(cm);

  bc.recordTask('write authentication module');
  bc.recordTask('write authentication tests');
  assertEqual(bc.areTasksRelated('write authentication module', 'write authentication tests'), true, 'Related tasks detected');

  bc.lastClear = Date.now();
  assertEqual(bc.areTasksRelated('write authentication module', 'write authentication tests'), true, 'Related tasks not cleared - correct');

  const compactResult = bc.shouldCompact(50, 0.3);
  assertEqual(typeof compactResult, 'boolean', 'shouldCompact returns boolean');

  const clearResult = bc.shouldClear('new task', 'completely unrelated task');
  assertEqual(typeof clearResult, 'boolean', 'shouldClear returns boolean');

  const compressResult = bc.shouldCompress(90);
  assertEqual(typeof compressResult, 'boolean', 'shouldCompress returns boolean');

  const initResult = bc.shouldInit('/tmp/test-project');
  assertEqual(typeof initResult, 'boolean', 'shouldInit returns boolean');

  const stats = bc.getCoordinationStats();
  assertExists(stats, 'Coordination stats returned');
  assertExists(stats.taskHistory, 'Task history tracked');
  assertExists(stats.currentTask, 'Current task tracked');

  const compactTrigger = bc.triggerCompact('focus on auth bug');
  assertEqual(compactTrigger.triggered, true, 'Compact triggered with focus');
  assertEqual(compactTrigger.command, '/compact focus on auth bug', 'Compact command has focus instructions');

  const clearTrigger = bc.triggerClear();
  assertEqual(clearTrigger.triggered, true, 'Clear triggered');
  assertEqual(clearTrigger.command, '/clear', 'Clear command correct');

  const compressTrigger = bc.triggerCompress();
  assertEqual(compressTrigger.triggered, true, 'Compress triggered');
  assertEqual(compressTrigger.command, '/compress', 'Compress command correct');

  const initTrigger = bc.triggerInit('/tmp/test-project');
  assertEqual(initTrigger.triggered, true, 'Init triggered');
  assertEqual(initTrigger.command, '/init', 'Init command correct');
  assertEqual(initTrigger.projectPath, '/tmp/test-project', 'Init project path correct');

  console.log('');
}

async function testPluginStructure() {
  console.log('--- Plugin Structure Tests ---');

  const pluginJsonPath = path.join(PLUGIN_DIR, 'plugin.json');
  assertExists(fs.existsSync(pluginJsonPath), 'plugin.json exists');
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  assertExists(pluginJson.name, 'plugin.json has name');
  assertExists(pluginJson.version, 'plugin.json has version');
  assertExists(pluginJson.hooks, 'plugin.json has hooks');
  assertExists(pluginJson.skills, 'plugin.json has skills');
  assertExists(pluginJson.commands, 'plugin.json has commands');

  const hooksJsonPath = path.join(PLUGIN_DIR, 'hooks', 'hooks.json');
  assertExists(fs.existsSync(hooksJsonPath), 'hooks/hooks.json exists');
  const hooksJson = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  assertExists(hooksJson.hooks, 'hooks.json has hooks array');
  assertEqual(hooksJson.hooks.length, 4, 'hooks.json has 4 hooks');

  const hookFiles = ['session-start.js', 'pre-tool-use.js', 'post-tool-use.js', 'stop.js'];
  for (const hookFile of hookFiles) {
    const hookPath = path.join(PLUGIN_DIR, 'hooks', hookFile);
    assertExists(fs.existsSync(hookPath), `hooks/${hookFile} exists`);
  }

  const libFiles = ['config-manager.js', 'mode-manager.js', 'quality-engine.js', 'cost-engine.js', 'builtin-coordinator.js'];
  for (const libFile of libFiles) {
    const libPath = path.join(PLUGIN_DIR, 'lib', libFile);
    assertExists(fs.existsSync(libPath), `lib/${libFile} exists`);
  }

  const skillFiles = ['SKILL.md', 'modes.md', 'dashboard.md', 'config.md'];
  for (const skillFile of skillFiles) {
    const skillPath = path.join(PLUGIN_DIR, 'skills', 'claude-opt-pro', skillFile);
    assertExists(fs.existsSync(skillPath), `skills/claude-opt-pro/${skillFile} exists`);
  }

  const commandFiles = ['opt-mode.md', 'opt-dashboard.md', 'opt-config.md', 'opt-report.md'];
  for (const cmdFile of commandFiles) {
    const cmdPath = path.join(PLUGIN_DIR, 'commands', cmdFile);
    assertExists(fs.existsSync(cmdPath), `commands/${cmdFile} exists`);
  }

  const configFiles = ['default-config.json', 'modes.json'];
  for (const configFile of configFiles) {
    const configPath = path.join(PLUGIN_DIR, 'config', configFile);
    assertExists(fs.existsSync(configPath), `config/${configFile} exists`);
  }

  assertExists(fs.existsSync(path.join(PLUGIN_DIR, 'README.md')), 'README.md exists');

  console.log('');
}

function printSummary() {
  console.log('=== Test Summary ===');
  console.log(`Passed: ${tests.passed}`);
  console.log(`Failed: ${tests.failed}`);

  if (tests.errors.length > 0) {
    console.log('\nErrors:');
    tests.errors.forEach(e => console.log(`  - ${e}`));
  }

  const total = tests.passed + tests.failed;
  const passRate = total > 0 ? ((tests.passed / total) * 100).toFixed(1) : 0;
  console.log(`\nPass Rate: ${passRate}% (${tests.passed}/${total})`);

  if (tests.failed === 0) {
    console.log('\nAll tests passed!');
  } else {
    console.log(`\n${tests.failed} test(s) failed.`);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});