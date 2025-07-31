import {
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { inject } from '../src/di';
import {
    Bucket,
    File,
    Storage,
} from '@google-cloud/storage';
import { createMockFactory, mockObject } from '../sdk/di';

const mockFn = createMockFactory(vi.fn);

describe('StorageProvider', () => {
    const bucket = mockObject(
        new Bucket(new Storage(), 'test-bucket'),
        mockFn,
    );

    beforeAll(() => {
        inject(
            'BucketProvider',
            vi.fn,
        ).getBucket.mockResolvedValue(bucket as any);
    });

    beforeEach(() => {
        bucket.upload.mockReset();
        bucket.file.mockReset();
    });

    it('creates a file in the bucket', async () => {
        const storageProvider = inject('StorageProvider');

        const fileHandle = await storageProvider.uploadFile(
            '/Users/something/test.txt',
        );

        expect(fileHandle).toBe('test.txt');

        expect(bucket.upload).toHaveBeenCalledWith(
            '/Users/something/test.txt',
            {
                contentType: 'plain/text',
                metadata: {
                    metadata: {
                        status: 'uploaded',
                    },
                },
            },
        );
    });

    it('updates a file metadata', async () => {
        const file = mockObject(
            new File(bucket as any, 'test.txt'),
            mockFn,
        );

        bucket.file.mockReturnValue(file as any);

        const storageProvider = inject('StorageProvider');

        await storageProvider.updateFileMetadata(
            'text.txt',
            {
                something: '123',
                somethingElse: '456',
            },
        );

        expect(file.setMetadata).toHaveBeenCalledWith({
            metadata: {
                something: '123',
                somethingElse: '456',
            },
        });
    });
});
