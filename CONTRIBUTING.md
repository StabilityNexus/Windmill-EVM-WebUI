# Contributing to Windmill Exchange (WebUI)

⭐ First off, thank you for considering contributing to this project! ⭐

We welcome contributions from everyone. By participating in this project, you agree to abide by our Code of Conduct.

## 📢 Discord Communication is Mandatory

**All project communication MUST happen on Discord.**

- Join our [Discord server](https://discord.gg/YzDKeEfWtS) before starting any work.
- Post your PR/issue updates in the project channel, `#windmill-exchange`.
- All discussions, questions, and updates should be on Discord. GitHub is for code only.
- **PRs without Discord updates will not be reviewed or may face delays.**

## Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
- [Coding with AI](#coding-with-ai)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style Guidelines](#code-style-guidelines)
- [Community Guidelines](#community-guidelines)
- [Issue Assignment](#issue-assignment)

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots/Video (if applicable)
- Environment details (OS, browser, versions, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why this feature would be useful
- Include examples of how it would work

### Contributing Code

1. **Submit an Issue First**: For features, bugs, or enhancements, create an issue first.
2. **Get Assigned**: Wait to be assigned before starting work (preferable).
3. **Submit Your PR**: Once assigned, create a PR addressing the issue.
4. **Unrelated PRs**: Pull requests unrelated to issues may be closed or take longer to review.

## Coding with AI

We accept the use of AI-powered tools (GitHub Copilot, ChatGPT, Claude, Cursor, etc.) for contributions, whether for code, tests, or documentation.

⚠️ Transparency is required: if you use AI assistance, please mention it in your PR description.

What we expect:

- **Disclose AI usage**: A simple note like "Used GitHub Copilot for autocompletion" or "Generated initial test structure with ChatGPT" is sufficient.
- **Specify the scope**: Indicate which parts of your contribution involved AI assistance.
- **Review AI-generated content**: Ensure you understand and have verified any AI-generated code before submitting.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

1. **Fork the Repository**

   Click the 'Fork' button at the top right of this page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Windmill-EVM-WebUI.git
   cd Windmill-EVM-WebUI
   ```

3. **Add Upstream Remote**

   ```bash
   git remote add upstream https://github.com/StabilityNexus/Windmill-EVM-WebUI.git
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Run the Project**

   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Feature Branch

Always work on a new branch, never on `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code.
- Follow the project's code style.
- Add comments where necessary.
- Update the documentation if needed (including `brand/` for branding changes).

### 3. Test Your Changes

Before opening a PR, run locally:

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript type-check
npm run build       # production build
```

### 4. Commit Your Changes

Write clear, concise commit messages:

```bash
git add .
git commit -m "feat: add user authentication"
# or
git commit -m "fix: resolve navigation bug"
```

**Commit Message Format:**

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Guidelines

### Before Submitting

- [ ] Your code follows the project's style guidelines
- [ ] You've tested your changes thoroughly (`npm run lint`, `npx tsc --noEmit`, `npm run build`)
- [ ] You've updated relevant documentation
- [ ] Your commits are clean and well-organized
- [ ] You've rebased with the latest upstream changes
- [ ] You've thought from the reviewer's perspective and made your PR easy to review

### Submitting a Pull Request

1. Go to the original repository on GitHub.
2. Click "New Pull Request".
3. Select your fork and branch.
4. Fill out the PR template with:
   - Clear description of changes
   - Link to related issue(s)
   - Screenshots (if UI changes)
   - Testing steps

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #issue_number

## Screenshots/Video (if applicable)
Add screenshots here

## Testing (if applicable)
Steps to test the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### After Submission

- Post your PR in `#windmill-exchange` on Discord for visibility (**IMPORTANT**).
- Respond to review comments promptly.
- Make requested changes in new commits.
- Be patient - maintainers will review when available.
- Use `[WIP]` in your PR title for incomplete PRs. Focus on one change until it gets merged.

## Code Style Guidelines

- Use TypeScript strict typing; avoid `any` unless necessary.
- Use **Tailwind CSS utility classes**; extend the design tokens in `app/globals.css`.
- Use **functional components** with hooks; follow the existing patterns in `components/`.
- Keep components small and focused; colocate styles and helpers.
- Format code with the project's lint rules and remove `console.log`s before committing.
- Use meaningful variable and function names.

## Community Guidelines

### Communication

- Be respectful and inclusive.
- Provide constructive feedback.
- Help others when you can.
- Ask questions - no question is too small!

### Progress Updates

- If your work is taking longer than expected, comment on Discord with updates.
- Issues should be completed within 5-30 days depending on complexity.
- If you can no longer work on an issue, let maintainers know on Discord.

### Getting Help

- Check existing documentation first.
- Search closed issues for similar problems.
- Ask in Discord.
- Tag maintainers if your PR is unattended for 1-2 weeks.

## Issue Assignment

- One contributor per issue (unless specified otherwise).
- If there are no active PRs for an issue for 2+ days, mention your intent under the issue and begin.
- Avoid working on issues which are assigned to someone, even if they are inactive.
- Check for existing PRs before starting to avoid duplication.

Thank you for contributing to Windmill Exchange. Your work helps the protocol ship faster and safer.