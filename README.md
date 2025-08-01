# Document Process Pipeline

**Author:** Adrian Larysz

## Overview

A command-line interface (CLI) tool for processing and extracting structured data from documents. The tool provides a flexible, language-agnostic interface for document processing workflows that can be integrated into any programming environment or automation pipeline.

## Design Assumptions

The current implementation is based on the following assumptions:

-   **Document Type**: Focused on invoice processing (no other document types supported)
-   **File Format**: Documents are in plain text (`.txt`) format for simplicity, though this can be extended to support other formats in the future
-   **Structure**: Documents follow a specific structured format as demonstrated in the example file: [test2.txt](./test-docs/test2.txt)

These assumptions allow for a focused, efficient implementation while maintaining extensibility for future enhancements.

## Prerequisites

Before running this project locally, ensure that:

-   **Yarn** is added to your `$PATH`
-   **Google Application Credentials** are available in your shell session
-   **Correct Permissions** have been granted to the service account or user

    You can authenticate using either a **service account** or your **personal Google Cloud user account**, depending on your setup.

    The following permissions are required for accessing Google Cloud Storage:

    -   `storage.buckets.list` — list available buckets
    -   `storage.objects.list` — list files in a bucket
    -   `storage.objects.get` — read file contents
    -   `storage.objects.create` — upload new files
    -   `storage.objects.update` — update file metadata

    You can also assign `roles/storage.objectAdmin` to simplify granting permissions.

-   **jq** is installed for running pipeline scripts: `brew install jq`

### Configuration

Configure your environment by modifying your `~/.zshrc` file:

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

### Development Setup

```bash
# Login to GCP account
# If you use google service account, skip this step
gcloud auth login

# Start development mode with file watching and CLI compilation
yarn dev

# Run tests in watch mode
yarn test

# Link this as global yarn dependency
yarn link
```

## CLI Commands

### `docs-cli upload --source <source> [--return-error]`

Uploads a file to Google Cloud Storage.

**Parameters:**

-   `--source` (required): Source file path in the format `file://<filePath>`
-   `--return-error` (optional): Returns errors as JSON instead of throwing exceptions

**Example:**

```bash
docs-cli upload --source file://./documents/invoice.txt
```

### `docs-cli extract-data --source <source> [--return-error]`

Extracts structured data from a file, validates it, and saves it as metadata.

**Parameters:**

-   `--source` (required): Source file identifier (file name in bucket)
-   `--return-error` (optional): Returns errors as JSON instead of throwing exceptions

**Example:**

```bash
docs-cli extract-data --source invoice.txt
```

### `docs-cli list [--status <status>]`

Lists files in the bucket with their metadata and content.

**Parameters:**

-   `--status` (optional): Filter files by status (e.g., 'uploaded', 'validated', 'invalid')

**Example:**

```bash
docs-cli list --status uploaded
```

## Pipeline Scripts

The project includes several pipeline scripts that demonstrate different processing workflows:

### Single File Processing

```bash
# Process a single file: upload and extract data
# Replace bucket_name with your actual bucket name
# If bucket does not exist, it will be created

./pipeline-single.sh bucket_name ./test-docs/test.txt
./pipeline-single.sh bucket_name ./test-docs/test2.txt
./pipeline-single.sh bucket_name ./test-docs/test3.txt
```

### Batch Processing

```bash
# Upload all files from a directory
# Then extracts data for all "uploaded" files
# Replace bucket_name with your actual bucket name
# If bucket does not exist, it will be created

./pipeline-upload.sh bucket_name ./test-docs
./pipeline-extract.sh bucket_name
```

## Architecture

The tool is built with a modular architecture that separates concerns:

-   **CLI Commands**: Provide the interface for document processing operations
-   **Pipeline Scripts**: Orchestrate complex workflows using CLI commands
-   **Protocol Extensibility**: Support for multiple source types (`file://`, `url://`, etc.) (currently only `file://` is supported)
-   **Error Handling**: Both human-readable and machine-readable error formats

This design enables flexible integration into various environments, from simple shell scripts to complex microservice architectures.

## File Status and Metadata

The system uses a status-based workflow to track document processing stages. Each file's metadata is updated throughout the processing pipeline:

### Status Lifecycle

1. **Upload Stage** (`docs-cli upload`)

    - Sets `status: "uploaded"`
    - File is ready for data extraction

2. **Extraction Stage** (`docs-cli extract-data`)
    - **Success**: Sets `status: "validated"` and adds extracted data
    - **Failure**: Sets `status: "invalid"` and stores invalid data for inspection

### Metadata Structure

#### Validated Files

```json
{
    "status": "validated",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "total": "500",
    "products": "[{\"name\":\"Product 1\",\"price\":\"100\",\"quantity\":\"1\"}]"
}
```

#### Invalid Files

```json
{
    "status": "invalid",
    "data": "{\"customerName\":\"\",\"products\":[...],\"total\":\"500invalid\"}"
}
```

### Status Filtering

Use the `list` command with status filtering to monitor processing progress:

```bash
# List all uploaded files ready for processing
docs-cli list --status uploaded

# List all successfully validated files
docs-cli list --status validated

# List all files that failed validation
docs-cli list --status invalid
```

## Integration Examples

The CLI's language-agnostic design allows seamless integration into any programming environment or CI/CD pipeline. Here are some practical examples:

### Rust Integration

```rust
use std::process::Command;
use serde_json::Value;

#[derive(Debug)]
enum UploadResult {
    Success,
    NotFound,
    Error(String),
}

fn extract_data(file_name: &str) -> UploadResult {
    let output = Command::new("docs-cli")
        .args(&["extract-data", "--source", file_name, "--return-error"])
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                // Success case - no output
                UploadResult::Success
            } else {
                // Error case - try to parse JSON from stdout
                let stdout = String::from_utf8_lossy(&output.stdout);
                if let Ok(json) = serde_json::from_str::<Value>(&stdout) {
                    if let Some(error_msg) = json.get("error").and_then(|e| e.as_str()) {
                        if error_msg == "File not found" {
                            UploadResult::NotFound
                        } else {
                            UploadResult::Error(error_msg.to_string())
                        }
                    } else {
                        UploadResult::Error("Unknown error".to_string())
                    }
                } else {
                    UploadResult::Error("Failed to parse error output".to_string())
                }
            }
        }
        Err(e) => UploadResult::Error(e.to_string()),
    }
}
```

### CI/CD Pipeline Integration

The CLI can be easily integrated into various CI/CD platforms:

-   **Google Cloud Build**: Use in build steps for document processing
-   **CircleCI**: Add to workflows for automated document analysis
-   **GitHub Actions**: Process documents as part of pull request workflows
-   **Jenkins**: Integrate into build pipelines for document validation

### Microservice Architecture

In microservice environments, the CLI provides a standardized interface for document processing that can be called from any service, regardless of the programming language used.

---

## Side Notes

### Testing Infrastructure

The [SDK](./sdk) and [shell helper](./test/helpers/shell.ts) were created for another project and were designed to simplify the testing process. You can see the results in the test files: [extract-data](./test/extract-data.spec.ts), [list](./test/list.spec.ts), [upload](./test/upload.spec.ts), and [storage.provider](./test/storage.provider.spec.ts).

I'm aware of the limitations of these functions. They work excellently with classes or objects that contain simple functions, but they struggle with complex objects like Google Cloud Storage objects that have dynamic methods and complex inheritance structures. Additionally, my SDK functions weren't designed to support async factories, which further complicates testing of such complex external dependencies.

### External API Testing Strategy

The [bucket.provider](./src/providers/bucket.provider.ts) was deliberately not tested using unit tests. This class should be tested using end-to-end tests due to its complex interactions with the Google Cloud Storage API.

### Module Resolution Configuration

The project uses ES2021 output for improved readability while maintaining TypeScript's standard import syntax without file extensions. To resolve ESM module resolution requirements, a custom module loader was implemented:

-   **Package Configuration**: The [package.json](./package.json) defines the CLI entry point using a shell script wrapper
-   **Module Loader**: A custom [loader.js](./loader.js) handles module resolution and extension mapping
-   **Entry Point**: The [index.sh](./index.sh) script serves as the CLI bootstrap

This approach allows the use of clean import statements (`import { something } from './something'`) while ensuring proper ESM compatibility and maintaining the desired output format.

### Console Output Strategy

The CLI uses a strategic approach to console output to enable proper integration with other tools and scripts:

-   **`console.log`**: Writes to standard output (stdout) - used for return values that can be captured by other scripts
-   **`console.error`**: Writes to standard error (stderr) - used for logging and debugging information that should not interfere with return values

The [Helper](./src/helper.ts) class simplifies this distinction:

-   **`helper.return()`**: Outputs data to stdout for programmatic consumption
-   **`helper.log()`**: Outputs logs to stderr for debugging and monitoring

This separation ensures that when the CLI is called from other scripts or programs, the return values can be cleanly captured without being mixed with log messages.

### DI System Enhancement (01.08.2025)

The dependency injection system was significantly enhanced to address complex external API testing challenges. The update introduced several key improvements:

#### **Problem Solved:**

-   **Complex GCP object mocking** - Google Cloud Storage objects have overloaded methods and dynamic properties
-   **Type safety issues** - Previous approach required `as any` type assertions
-   **Overloaded function signatures** - GCP methods have multiple signatures that TypeScript couldn't handle properly

#### **Solution Implemented:**

**1. GCP Storage Abstraction Layer:**

-   Created `gcp-storage` module with getter-based dependency injection
-   Replaced direct GCP object usage with clean getter interfaces
-   Eliminated complex object chaining (`new Storage().getBucket().getFile()`)

**2. Type-Safe Mocking System:**

-   Implemented `FirstPromiseOverload` type utility to handle overloaded functions
-   Created `initFunctionsFactory` for explicit function extraction
-   Built `dummyObject` factory for type-safe mock creation

**3. Enhanced Testing Infrastructure:**

-   Simplified test setup with `createMockedBucket` and `createMockedFile` helpers
-   Eliminated complex manual mocking in favor of declarative mock creation
-   Maintained full type safety without `as any` assertions

#### **Architectural Changes:**

-   **Before**: Direct GCP object injection with complex mocking
-   **After**: Getter-based abstraction with clean interfaces

**Example of improvement:**

```typescript
// Before: Complex setup with type assertions
const file = mockObject(
    new File(bucket, 'test.txt'),
    mockFn,
) as any;
file.getMetadata.mockResolvedValue([{ metadata: {} }]);

// After: Clean, type-safe setup
const mockedFile = createMockedFile(
    'test.txt',
    'content',
    {},
);
gcpStorageInject('FileGetter', vi.fn).get.mockResolvedValue(
    mockedFile,
);
```

#### **Benefits:**

-   **Type Safety**: Eliminated `as any` assertions in business logic
-   **Test Simplicity**: Reduced test setup complexity by ~18%
-   **Maintainability**: Clear separation between GCP abstraction and business logic
-   **Extensibility**: Easy to add new GCP services or external APIs

**Commit**: [DI System Enhancement](https://github.com/Massfice/document-process-pipeline/commit/21a1b32789e901fa9d3468caf88a5189a73a6da5#diff-97ed604fa967ece3ac3c2697051e54ec3061829d7a35ba7f52870461289f1194)
