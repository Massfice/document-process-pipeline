import { ApiError } from '@google-cloud/storage';
import { Helper } from '../helper';
import { BucketProvider } from './bucket.provider';

export class StorageProvider {
    constructor(
        private readonly bucketProvider: BucketProvider,
        private readonly helper: Helper,
    ) {}

    async uploadFile(fileName: string) {
        const bucket =
            await this.bucketProvider.getBucket();

        this.helper.log('info', {
            message: `Uploading file to bucket: ${bucket.name}`,
            fileName,
        });

        await bucket.upload(fileName, {
            contentType: 'plain/text',
            metadata: {
                metadata: {
                    status: 'uploaded',
                },
            },
        });

        const fileHandle = fileName.split('/').pop();

        this.helper.log('info', {
            message: 'Uploaded file handle',
            fileHandle,
        });

        if (!fileHandle) {
            throw new Error('File handle not found');
        }

        return fileHandle;
    }

    async updateFileMetadata(
        fileName: string,
        metadata: Record<string, string>,
    ) {
        const bucket =
            await this.bucketProvider.getBucket();

        this.helper.log('info', {
            message: 'Updating file metadata',
            fileName,
            metadata,
        });

        await bucket.file(fileName).setMetadata({
            metadata: {
                ...metadata,
            },
        });
    }

    async getFileContent(fileName: string) {
        const bucket =
            await this.bucketProvider.getBucket();

        const file = bucket.file(fileName);

        try {
            const readStream = file.createReadStream();

            this.helper.log('info', {
                message: 'Getting file content',
                fileName,
            });

            const data: string | null =
                await new Promise<string>(
                    (resolve, reject) => {
                        let data = '';

                        readStream.on('data', (chunk) => {
                            data += chunk;
                        });

                        readStream.on('end', () => {
                            resolve(data);
                        });

                        readStream.on('error', (error) => {
                            reject(error);
                        });
                    },
                );

            this.helper.log('info', {
                message: 'File content',
                fileName,
                data,
            });

            return data;
        } catch (error) {
            if (
                error instanceof ApiError &&
                error.code === 404
            ) {
                if (error.code === 404) {
                    this.helper.log('info', {
                        message: 'File not found',
                        fileName,
                    });

                    return null;
                }
            }

            throw error;
        }
    }

    async listFiles(status?: string) {
        const bucket =
            await this.bucketProvider.getBucket();

        const [files] = await bucket.getFiles();

        const filesWithMetadata = await Promise.all(
            files.map(async (file) => {
                const [{ metadata }] =
                    await file.getMetadata();
                const content = await this.getFileContent(
                    file.name,
                );

                return {
                    fileName: file.name,
                    content,
                    metadata,
                };
            }),
        );

        if (status) {
            return filesWithMetadata.filter(
                (file) =>
                    file.metadata &&
                    file.metadata.status === status,
            );
        }

        return filesWithMetadata;
    }
}
