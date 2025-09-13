#!/bin/bash

echo "Adding GitHub repository as remote 'github'..."
git remote add github https://github.com/Dent-Harvey/Conflict-Connect.git

echo "Fetching from GitHub repository..."
git fetch github

echo "Checking available branches..."
git branch -r

echo "Current branch and status:"
git status

echo "Attempting to merge changes from GitHub main branch..."
git merge github/main --allow-unrelated-histories

echo "Final status:"
git status