#!/bin/bash
set -e

echo "🔄 Starting import process from GitHub repository..."
echo "Repository: https://github.com/Dent-Harvey/Conflict-Connect.git"
echo ""

# Check current status
echo "📊 Current git status:"
git status --short

echo ""
echo "📋 Current remotes:"
git remote -v

echo ""
echo "🔍 Attempting to fetch from GitHub remote..."
if git fetch github 2>/dev/null; then
    echo "✅ Successfully fetched from GitHub"
    
    echo ""
    echo "📂 Available branches from GitHub:"
    git branch -r | grep github/
    
    echo ""
    echo "📜 Recent commits on GitHub main:"
    git log --oneline -5 github/main || git log --oneline -5 github/master || echo "Could not show GitHub commits"
    
    echo ""
    echo "🔄 Attempting to merge changes..."
    if git merge github/main --no-edit --allow-unrelated-histories; then
        echo "✅ Successfully merged changes from GitHub"
    elif git merge github/master --no-edit --allow-unrelated-histories; then
        echo "✅ Successfully merged changes from GitHub (master branch)"
    else
        echo "❌ Merge failed. Manual intervention required."
        echo "Conflict files:"
        git status --short
        exit 1
    fi
else
    echo "❌ Failed to fetch from GitHub. Possible reasons:"
    echo "  - Repository doesn't exist or is private"
    echo "  - Network connectivity issues"
    echo "  - Authentication required"
    echo ""
    echo "Trying to clone repository to temporary location for analysis..."
    
    cd /tmp
    if git clone https://github.com/Dent-Harvey/Conflict-Connect.git github-repo 2>/dev/null; then
        echo "✅ Successfully cloned repository to /tmp/github-repo"
        echo ""
        echo "📂 Repository structure:"
        ls -la github-repo/
        
        echo ""
        echo "📋 Recent commits:"
        cd github-repo
        git log --oneline -5
        
        echo ""
        echo "📄 Main files:"
        find . -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -10
        
    else
        echo "❌ Could not access the GitHub repository"
        echo "Please verify:"
        echo "  - Repository URL is correct"
        echo "  - Repository is public or you have access"
        echo "  - Repository exists"
    fi
fi

echo ""
echo "🏁 Import process completed."