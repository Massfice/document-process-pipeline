#!/bin/bash

export BUCKET_NAME="e3dc10f0-d065-4d40-9051-ea09522b9db9"

fileid=$(docs-cli upload --source file://test.txt)
if [ $? -ne 0 ]; then
    echo "Error: docs-cli upload failed"
    exit 1
fi

echo "fileid: $fileid"
