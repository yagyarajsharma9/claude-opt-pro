# Contributing to Claude Optimizer Pro

## Getting Started

### Setup
```bash
git clone https://github.com/yagyarajsharma9/claude-opt-pro.git
cd claude-opt-pro
npm install
```

### Running Tests
```bash
npm test
```

All tests must pass before submitting a PR.

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run tests (`npm test`)
6. Commit with clear message (`git commit -m 'feat: add amazing feature'`)
7. Push to your fork
8. Open a Pull Request

## Code Standards

- JavaScript (Node.js 18+)
- No comments unless absolutely necessary
- Follow existing code style
- 100% test coverage for new features
- All existing tests must pass

## Plugin Architecture

- `hooks/` - Claude Code hook scripts (SessionStart, PreToolUse, PostToolUse, Stop)
- `lib/` - Core JavaScript modules (ConfigManager, ModeManager, QualityEngine, CostEngine, BuiltinCoordinator)
- `skills/` - Claude Code skill markdown files
- `commands/` - Slash command markdown files
- `config/` - JSON configuration files (default-config.json, modes.json, user-config.json)
- `tests/` - Automated test suite

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag (`git tag v0.1.1`)
4. Push tag (`git push origin v0.1.1`)
5. Create GitHub release

## Contact

- **GitHub:** [@yagyarajsharma9](https://github.com/yagyarajsharma9)
- **Email:** yagayrajsharma@gmail.com