# Contributing to Mathpati

Thank you for your interest in contributing to Mathpati! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git
- Docker (optional, for containerized development)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Mathpati.git
cd Mathpati

# Add upstream remote
git remote add upstream https://github.com/nakshatra207/Mathpati.git

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
Mathpati/
├── src/                  # Application source code
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static assets
├── tests/               # Test files
├── k8s/                 # Kubernetes manifests
├── scripts/             # Deployment scripts
└── server/              # Metrics server
```

## 💻 Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint

# Build the project
npm run build

# Test with Docker
make docker-build
make docker-up
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines) below.

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Styling

- Use TailwindCSS utility classes
- Follow existing styling patterns
- Keep styles consistent across components
- Use shadcn/ui components when available

### Code Quality

```typescript
// Good: Clear, typed, and documented
interface UserProps {
  name: string;
  age: number;
}

/**
 * Displays user information
 */
const UserCard: React.FC<UserProps> = ({ name, age }) => {
  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-600">Age: {age}</p>
    </div>
  );
};

// Bad: Unclear, untyped
const Card = (props: any) => {
  return <div>{props.n}</div>;
};
```

## 📋 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `perf` - Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(quiz): add timer functionality"

# Bug fix
git commit -m "fix(auth): resolve login validation issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case"
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] Commits follow convention
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer approval required
3. Address review feedback
4. Keep PR updated with main branch
5. Squash commits if requested

### After Approval

- Maintainers will merge your PR
- Your changes will be included in the next release
- You'll be added to contributors list

## 🧪 Testing

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard name="John" age={25} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Age: 25')).toBeInTheDocument();
  });

  it('handles missing props gracefully', () => {
    render(<UserCard name="" age={0} />);
    
    expect(screen.getByText('Age: 0')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test critical paths thoroughly
- Include edge cases
- Test error handling

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserCard.test.tsx

# Generate coverage report
npm test -- --coverage
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates the user's quiz score
 * @param answers - Array of user answers
 * @param correctAnswers - Array of correct answers
 * @returns Score as a percentage (0-100)
 */
function calculateScore(
  answers: string[],
  correctAnswers: string[]
): number {
  // Implementation
}
```

### README Updates

- Keep README.md up to date
- Update examples if API changes
- Add new features to feature list
- Update installation steps if needed

### Documentation Files

- Update relevant .md files
- Add new guides when needed
- Keep documentation clear and concise
- Include code examples

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Test on latest version
- Gather relevant information

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.10.0]
- Version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## 🎯 Development Tips

### Hot Reload

Development server supports hot reload:
```bash
npm run dev
```

### Docker Development

```bash
# Start development environment
make docker-dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Debugging

```typescript
// Use console.log for quick debugging
console.log('Debug:', variable);

// Use debugger statement
debugger;

// Use React DevTools
// Install browser extension
```

### Performance

- Use React.memo for expensive components
- Implement proper key props in lists
- Avoid unnecessary re-renders
- Use lazy loading for routes

## 📞 Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community (if available)

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Added to GitHub contributors page

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Mathpati! 🎉
