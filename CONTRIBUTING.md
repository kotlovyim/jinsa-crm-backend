# Contributing to Jinsa CRM

First off, thank you for considering contributing to Jinsa CRM! We appreciate your time and effort in making this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Commit Message Guidelines](#-commit-message-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Reporting Bugs](#-reporting-bugs)
- [Feature Requests](#-feature-requests)
- [License](#-license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** the project to your own machine
3. **Commit** changes to your own branch
4. **Push** your work back up to your fork
5. Submit a **Pull Request** so we can review your changes

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Local Setup

```bash
# Clone your fork
git clone https://github.com/kotlovyim/jinsa-crm-backend.git
cd jinsa-crm-backend

# Install dependencies
npm install

# Start the development environment
docker-compose up -d
```

## 🔄 Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

2. Make your changes following our coding standards

3. Run tests:
   ```bash
   npm test
   ```

4. Commit your changes following our commit message guidelines

5. Push to your fork:
   ```bash
   git push origin your-branch-name
   ```

## ✏️ Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Example:
```
feat(auth): add Google OAuth authentication

- Add Google OAuth2 strategy
- Update user model with OAuth fields
- Add login route for OAuth callback

Closes #123
```

## 🔄 Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/)
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you

## 🧑‍💻 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the [TypeScript style guide](https://google.github.io/styleguide/tsguide.html)
- Use ESLint and Prettier for code formatting
- Write meaningful variable and function names
- Keep functions small and focused on a single task

### Documentation
- Document all public APIs using JSDoc
- Keep inline comments to a minimum; write self-documenting code instead
- Update relevant documentation when making changes

## 🐛 Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/kotlovyim/jinsa-crm-backend/issues).

### Before Submitting a Bug Report
- Check if the issue has already been reported
- Check if the issue has been fixed in the latest version

### How to Submit a Good Bug Report
1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Describe the behavior you observed
4. Explain which behavior you expected to see
5. Include screenshots or logs if applicable

## ✨ Feature Requests

We welcome feature requests! Before submitting a new feature request, please:

1. Check if a similar feature already exists
2. Explain why this feature would be valuable to the project
3. Include any relevant use cases or examples

## 📄 License

By contributing, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing to Jinsa CRM! Your help is greatly appreciated.
