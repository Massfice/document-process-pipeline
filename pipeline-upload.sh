#!/bin/bash

export BUCKET_NAME="$1"
DIRECTORY_NAME="$2"

for file in "$DIRECTORY_NAME"/*; do
    if [ -f "$file" ]; then
        docs-cli upload --source file://$file

        if [ $? -ne 0 ]; then
            echo "Error: docs-cli upload failed"
            exit 1
        fi
    fi
done
