# Contributing to ADHDRelief

Thank you for your interest in contributing to ADHDRelief! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Chrome browser 109+ or Edge 109+
- Git
- Node.js 20+ (optional, for linting)
- Python 3 with Pillow (optional, for icon generation)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ADHDRelief.git
   cd ADHDRelief
   ```

2. **Load the extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `ADHDRelief` directory

3. **Make your changes**
   - Edit the code
   - Test thoroughly in Chrome

4. **Validate before committing**
   ```bash
   ./scripts/validate.sh
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch for integration
- Feature branches - `feature/your-feature-name`
- Bug fixes - `fix/bug-description`

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Keep the ADHD-friendly design principles
   - Add comments for complex logic

3. **Test locally**
   - Load the extension in Chrome
   - Test all affected features
   - Run validation script: `./scripts/validate.sh`

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

### Commit Message Format

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: Add new ocean waves sound
fix: Correct volume slider range
docs: Update installation instructions
style: Format popup.js with consistent spacing
```

## Code Guidelines

### JavaScript Style

- Use `const` and `let`, avoid `var`
- Use async/await for asynchronous code
- Add JSDoc comments for complex functions
- Follow existing naming conventions
- No console.logs in production code (use `console.log` with `[ADHD Relief]` prefix for debugging)

### ADHD-Friendly Design Principles

When adding UI elements:

1. **Large Touch Targets**: Minimum 44x44px for buttons
2. **Clear Visual Hierarchy**: Use size, color, and spacing
3. **No Animations**: Avoid distracting movements
4. **High Contrast**: Ensure text is readable
5. **Simple Language**: Clear, concise labels
6. **Consistent Patterns**: Follow existing UI patterns

### File Organization

```
ADHDRelief/
├── popup/           # UI components
├── background/      # Service worker (state management)
├── offscreen/       # Audio generation
├── sounds/          # Audio files
├── icons/           # Extension icons
└── scripts/         # Build and validation scripts
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- ✅ All sound types play correctly
- ✅ Volume control works smoothly
- ✅ Timer functions properly (start, stop, phase switching)
- ✅ Custom sound upload and deletion
- ✅ Sound reordering (drag-and-drop)
- ✅ Mode switching (Continuous ↔ Break)
- ✅ Keyboard shortcuts work
- ✅ State persists after browser restart
- ✅ No console errors

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Edge (latest)
- Brave (if available)

## Adding New Features

### Adding a New Sound Type

1. Add sound file to `/sounds/` directory
2. Update `BUILTIN_SOUNDS` in `popup/popup.js`
3. Add loading logic in `offscreen/audio-generator.js`
4. Update `manifest.json` `web_accessible_resources` if needed
5. Test playback and looping
6. Update README.md

### Adding UI Elements

1. Add HTML to `popup/popup.html`
2. Add CSS to `popup/popup.css`
3. Add JavaScript logic to `popup/popup.js`
4. Test accessibility (keyboard navigation, screen readers)
5. Ensure ADHD-friendly design (large buttons, clear hierarchy)

## CI/CD Process

### Continuous Integration

When you push or create a PR, GitHub Actions will:

1. Validate `manifest.json`
2. Check for required files
3. Lint JavaScript files
4. Scan for sensitive data
5. Provide validation summary

Fix any issues before the PR can be merged.

### Creating a Release

Only maintainers can create releases:

1. Update version in `manifest.json`
2. Commit: `git commit -m "chore: Bump version to 1.1.0"`
3. Tag: `git tag v1.1.0`
4. Push: `git push origin v1.1.0`
5. GitHub Actions will automatically build and create a release

## Privacy Guidelines

ADHDRelief is privacy-first. When contributing:

- ❌ **Never** add analytics or tracking
- ❌ **Never** make external network requests
- ❌ **Never** collect user data
- ❌ **Never** require accounts or authentication
- ✅ **Always** process data locally
- ✅ **Always** respect user privacy

## Accessibility

Ensure your contributions are accessible:

- Use semantic HTML
- Provide ARIA labels where needed
- Test keyboard navigation
- Ensure sufficient color contrast
- Support screen readers

## Questions?

- Review existing code for examples
- Check the [README.md](README.md) for architecture details
- Read the [.github/README.md](.github/README.md) for CI/CD info
- Open an issue for clarification

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to ADHDRelief!** 🎧

Your contributions help people focus better and be more productive.
