#!/bin/bash

export BUCKET_NAME="$1"

files=$(docs-cli list --status uploaded)
if [ $? -ne 0 ]; then
    echo "Error: docs-cli list failed"
    exit 1
fi


echo "$files" | jq -r '.[].fileName' | while read -r fileName; do
    if [ -n "$fileName" ]; then
        echo "Processing: $fileName"
        docs-cli extract-data --source "$fileName"
        if [ $? -ne 0 ]; then
            echo "Error: docs-cli extract-data failed for $fileName"
        fi
    fi
done