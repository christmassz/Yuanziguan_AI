#!/bin/bash

# Change to the repository directory
cd "$(dirname "$0")"

# Check if there are any changes
if [[ -n $(git status --porcelain) ]]; then
    echo "Changes detected. Adding all changes..."
    git add .
    echo "Committing changes..."
    git commit -m "Automatic update $(date +"%Y-%m-%d %H:%M:%S")"
    echo "Pushing changes to remote repository..."
    git push
    echo "Changes pushed successfully!"
else
    echo "No changes detected."
fi 