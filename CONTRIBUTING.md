# Contributing to hao-backprop-test

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

> ⚠️ **IMPORTANT**: This is a test project for Backprop integration. Please exercise caution when making changes, as modifications may affect integration testing workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Questions](#questions)

## Getting Started

Before contributing, please:

1. Read the [README.md](README.md) to understand the project purpose
2. Ensure you have the required development environment
3. Understand that this is a minimal test project - keep changes minimal

## Development Setup

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Git

### Setup Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd hao-backprop-test

# 2. Install dependencies
npm install

# 3. Start the server
node server.js

# 4. Verify it works
curl http://127.0.0.1:3000
# Should return: Hello, World!
```

## Making Changes

### Before You Start

1. Check if an issue already exists for your change
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Change Guidelines

Given the nature of this test project:

- **Keep changes minimal** - This is a sandbox project
- **Document your changes** - Update README if behavior changes
- **Test thoroughly** - Verify the server still works after changes
- **Preserve existing behavior** - Don't break the "Hello, World!" response

### What to Avoid

- Adding unnecessary dependencies
- Changing the server host/port without documentation
- Removing the warning about this being a test project
- Making changes that could break Backprop integration tests

## Pull Request Process

1. **Update Documentation**: Ensure README.md reflects any changes
2. **Test Your Changes**: Run the server and verify the endpoint
3. **Create Pull Request**: Use a clear, descriptive title
4. **Describe Changes**: Explain what and why in the PR description
5. **Request Review**: Wait for maintainer approval

### PR Checklist

- [ ] Server starts without errors (`node server.js`)
- [ ] Endpoint returns expected response (`curl http://127.0.0.1:3000`)
- [ ] Documentation updated if needed
- [ ] No unnecessary files added
- [ ] Changes don't break existing functionality

## Code Style Guidelines

### JavaScript

- Use `const` for constants, `let` for variables
- Use template literals for string interpolation
- Use meaningful variable names
- Add comments for complex logic

### Example

```javascript
// Good
const hostname = '127.0.0.1';
const port = 3000;

// Avoid
var h = '127.0.0.1';
var p = 3000;
```

### Markdown

- Use ATX-style headers (`#`, `##`, `###`)
- Include code blocks with language identifiers
- Use tables for structured data
- Keep line lengths reasonable

## Testing Requirements

> **Note**: This project currently has no automated test suite.

### Manual Testing

Before submitting changes, manually verify:

1. **Server Startup**:
   ```bash
   node server.js
   # Expected: "Server running at http://127.0.0.1:3000/"
   ```

2. **Endpoint Response**:
   ```bash
   curl http://127.0.0.1:3000
   # Expected: "Hello, World!"
   ```

3. **Response Headers**:
   ```bash
   curl -I http://127.0.0.1:3000
   # Expected: HTTP/1.1 200 OK, Content-Type: text/plain
   ```

### Future Testing Improvements

If you'd like to contribute tests:

- Consider using Jest or Mocha for unit tests
- Add integration tests for the HTTP endpoint
- Update `package.json` scripts accordingly

## Questions

If you have questions about contributing:

1. Check the [README.md](README.md) first
2. Review existing issues and pull requests
3. Contact the project maintainer

---

*Thank you for contributing to hao-backprop-test!*

[← Back to README](README.md)
