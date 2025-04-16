# Contributing to this project - backend

## Code of Conduct

By contributing, you agree to uphold our community's standards of professionalism, respect, and inclusivity.

## Getting Started

**Install dependencies**:  
 Follow the instructions in the `README.md` to set up the project locally.

## Branching Strategy

- Use the following naming convention for branches:

  - `feature/short-description`
  - `fix/short-description`
  - `chore/short-description`

- Work only in your branch and submit a pull request when ready for review.

## Commit Messages

We follow the **Conventional Commits** specification. Please adhere to the following format:

```
<type>(scope): <short summary>
```

### Common Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (non-functional)
- `refactor`: Code refactoring (neither a feature nor a bug fix)
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks (build scripts, configs, etc.)

### Examples

- `feat(auth): add user login functionality`
- `fix(api): correct data fetching issue`
- `docs(readme): improve setup instructions`

## Code quality insurance

We use Husky to run the linter and compile before you commit
this avoids commiting smelly code and enhances code quality at the root

## Pull Request Process

1. Ensure your code passes all tests and follows the linting rules.
2. Write a clear description of the changes in your PR.
3. Add reviewers to your PR.
4. Wait for approvals before merging.

## Reporting Issues

If you encounter any issues or bugs, please report them with the following:

- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
