#!/bin/bash

OUTPUT_FILE="`basename $(pwd)`_project_context.txt"

# Directories to exclude
EXCLUDE_DIRS=("node_modules" ".git" "dist" "build" "bin" ".next" "coverage")

# Clear or create the output file
echo "Preparing project context..." > "$OUTPUT_FILE"
printf '\n' >> "$OUTPUT_FILE"

# Helper function to include file content with a header
include_file() {
  local file="$1"
  echo "=== FILE: $file ===" >> "$OUTPUT_FILE"
  cat "$file" >> "$OUTPUT_FILE"
  printf '\n\n' >> "$OUTPUT_FILE"
}

# Construct the find command with excluded directories
FIND_CMD="find ."
for dir in "${EXCLUDE_DIRS[@]}"; do
  FIND_CMD+=" -path './$dir' -prune -o"
done

# Add file type filters
FIND_CMD+=" -type f \( -name '*.go' -o -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.py' -o -name '*.html' -o -name '*.md' \) -print"

# Execute the constructed find command
sh -c "$FIND_CMD" | while read -r file; do
  include_file "$file"
done

echo "✅ Context preparation complete: $OUTPUT_FILE"