#!/bin/bash

export BUCKET_NAME="$1"
FILE_NAME="$2"

fileid=$(docs-cli upload --source file://$FILE_NAME)
if [ $? -ne 0 ]; then
    echo "Error: docs-cli upload failed"
    exit 1
fi

docs-cli extract-data --source $fileid
if [ $? -ne 0 ]; then
    echo "Error: docs-cli extract-data failed"
    exit 1
fi

