# Contributing to NavEd

Thank you for your interest in contributing to NavEd! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-repo/naved/issues)
2. If not, create a new issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Provide as much detail as possible:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, device, app version)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Clearly describe the use case and benefits

### Submitting Code Changes

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the code style guidelines
   - Write or update tests
   - Update documentation if needed
4. **Run validation**
   ```bash
   npm run validate
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Request review from maintainers

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type (use `unknown` if necessary)
- Define interfaces for object shapes
- Use meaningful variable and function names

### React Native

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

### File Organization

- Follow the feature-based structure
- Place files in appropriate directories:
  - `frontend/features/[feature]/` for feature-specific code
  - `frontend/shared/` for shared code
- Use barrel exports (`index.ts`) for cleaner imports

### Naming Conventions

- **Components**: PascalCase (e.g., `AccessibleButton.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Functions**: camelCase (e.g., `getParkingLots`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Code Formatting

- Run `npm run format` before committing
- Use Prettier for consistent formatting
- Follow ESLint rules (run `npm run lint`)

## Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for >80% code coverage
- Place tests in `__tests__/` mirroring the source structure

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test/file.test.ts
```

### Test Structure

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test both success and error cases

## Documentation

### Code Comments

- Add JSDoc comments for public functions
- Explain complex logic with inline comments
- Keep comments up-to-date with code changes

### README Updates

- Update README.md for user-facing changes
- Add examples for new features
- Update installation instructions if needed

## Pull Request Process

1. **Ensure your PR:**
   - Passes all tests (`npm test`)
   - Passes linting (`npm run lint`)
   - Passes type checking (`npm run type-check`)
   - Follows code style guidelines
   - Includes necessary documentation

2. **PR Description should include:**
   - Summary of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (for UI changes)

3. **Review Process:**
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Once approved, maintainers will merge

## Development Setup

See [README.md](README.md) for installation and setup instructions.

## Questions?

- Open an issue for questions
- Check existing documentation in `docs/`
- Review [STRUCTURE.md](STRUCTURE.md) for project architecture

Thank you for contributing to NavEd! 🎉

