# Recipe Search App Git Workflow

This project follows the Feature Branch Workflow for development. This document outlines the process for contributing to the project.

## Feature Branch Workflow

The core idea behind the Feature Branch Workflow is that all feature development should take place in a dedicated branch instead of the `main` branch. This keeps the main branch stable and makes collaboration easier.

## Workflow Steps

### 1. Starting a new feature

Always start from an up-to-date main branch:

```bash
git checkout main
git pull origin main
git checkout -b feature-name main
```

Choose a descriptive branch name related to the feature (e.g., `image-detection`, `recipe-filter`, etc.).

### 2. Making changes

Work on your feature, making commits as you go:

```bash
git add <files>
git commit -m "Descriptive commit message"
```

### 3. Pushing changes

Push your feature branch to share your work or back it up:

```bash
# First time pushing the branch
git push -u origin feature-name

# Subsequent pushes
git push
```

### 4. Creating a Pull Request

When your feature is ready:

1. Push your final changes to the feature branch
2. Create a pull request to merge into main
3. Request code review from team members
4. Address feedback with additional commits to your branch

### 5. Merging the feature

After approval:

```bash
git checkout main
git pull origin main
git merge feature-name
git push origin main
```

Alternatively, use the merge button in GitHub/GitLab/etc. after the pull request is approved.

### 6. Cleaning up

After your feature is merged:

```bash
git branch -d feature-name  # Delete local branch
git push origin --delete feature-name  # Delete remote branch (optional)
```

## Benefits

- Keeps the main branch stable
- Makes code review easier
- Allows multiple features to be developed in parallel
- Creates a cleaner project history 