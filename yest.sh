#!/bin/bash

# Get the current system date in the format YYYY-MM-DD
current_date=$(date +%Y-%m-%d)

# Get the list of modified files in the git repository
files=$(git status --porcelain)

if [ -z "$files" ]; then
  echo "No changes detected."
  exit 0
fi

# Loop through each modified file
for file in $files; do
  # Set the date to the previous day
  
  # Add the file to the staging area
  git add "$file"

  # Commit the file with its name as the commit message
  git commit -m "$file"

  # Move the date forward by one day
  current_date=$(date +%Y-%m-%d -d "$current_date + 1 day")
  sudo date -s "$current_date"
done

# Restore the original date
sudo date -s "$current_date"

echo "All changes have been committed with date adjustments."
