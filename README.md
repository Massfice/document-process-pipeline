# document-process-pipeline

## Overview

A command-line interface (CLI) tool for process documents.

## Running locally

Before running this project locally, ensure that:

-   **Yarn** is added to your `$PATH`
-   **Google Application Credentials** are available in your shell session
-   **Correct Permissions** have been granted to the used service account or user

    You can authenticate using either a **service account** or your **personal Google Cloud user account**, depending on your setup.

    The following permissions are required for accessing Google Cloud Storage:

    -   `storage.buckets.list` — list available buckets
    -   `storage.objects.list` — list files in a bucket
    -   `storage.objects.get` — read file contents
    -   `storage.objects.create` — upload new files
    -   `storage.objects.update` — update file metadata

    You can also assign `roles/storage.objectAdmin` to simplify granting permissions.

You can configure these by modifying your `~/.zshrc` file:

```bash
# Google Application Credentials
# If you're using a **service account**, you must set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to your JSON key file.
# Skip this if you use personal account
export GOOGLE_APPLICATION_CREDENTIALS="<path_to_credentials_file>.json"

# Yarn Global Bin Path
export PATH="$(yarn global bin):$PATH"
```

After making these changes, reload your shell configuration:

```bash
source ~/.zshrc
```

Then you can run the following commands:

```bash
# Login to GCP account
# If you use google service account, skip this step
gcloud auth login

# Start development mode with file watching and CLI compilation
yarn dev

# Run tests in watch mode
yarn test

# Execute the example pipeline created u sing this CLI
./pipeline.sh
```
