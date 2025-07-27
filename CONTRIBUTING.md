# Contributing Guidelines

## Branch Structure
- `main`: Production-ready code
- `development`: Integration branch
- `feature/*`: Feature development [Work in Progress]

## Branch Naming Convention
All feature branches must follow this pattern:
`feature/[area]/[description]`

Examples:
- feature/frontend/login-page
- feature/backend/user-auth

Guidelines:
- Use lowercase letters
- Use hyphens (-) for spaces
- Keep descriptions brief but descriptive
- Always prefix with feature/frontend/ or feature/backend/

## Workflow
1. Create feature branch from `development`
2. Make changes and commit
3. Push to origin
4. Create Pull Request to `development`
5. Get approval
6. Merge

## Pull Request Rules
- At least 1 review required
- Must be up to date with development
- Must pass all checks