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

        await bucket.file(fileName).setMetadata({
            metadata: {
                ...metadata,
            },
        });
    }
}
