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
    ApiError,
    Bucket,
    File,
    GetFileMetadataResponse,
    GetFileResponse,
    Storage,
} from '@google-cloud/storage';
import { createMockFactory, mockObject } from '../sdk/di';
import { Readable } from 'stream';
import { Mock, Mocked } from '../sdk/di/types';

const mockFn = createMockFactory(vi.fn);

type MockedBucket = Omit<Mocked<Bucket>, 'getFiles'> & {
    getFiles: Mock<[], Promise<[GetFileResponse[0][]]>>;
};

type MockedFile = Omit<Mocked<File>, 'getMetadata'> & {
    getMetadata: Mock<
        [],
        Promise<[GetFileMetadataResponse[0]]>
    >;
};

describe('StorageProvider', () => {
    const bucket: MockedBucket = mockObject(
        new Bucket(new Storage(), 'test-bucket'),
        mockFn,
    ) as any;

    beforeAll(() => {
        inject(
            'BucketProvider',
            vi.fn,
        ).getBucket.mockResolvedValue(bucket as any);
    });

    beforeEach(() => {
        bucket.upload.mockReset();
        bucket.file.mockReset();
        bucket.getFiles.mockReset();
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

        expect(bucket.file).toHaveBeenCalledWith(
            'text.txt',
        );
    });

    it('returns file content', async () => {
        const file = mockObject(
            new File(bucket as any, 'test.txt'),
            mockFn,
        );

        bucket.file.mockReturnValue(file as any);

        const readStream = new Readable({
            read() {},
        });

        file.createReadStream.mockReturnValue(readStream);

        readStream.push('test');
        readStream.push(null);

        const storageProvider = inject('StorageProvider');

        const fileContent =
            await storageProvider.getFileContent(
                'test.txt',
            );

        expect(fileContent).toBe('test');
    });

    it('returns null if file does not exist', async () => {
        const file = mockObject(
            new File(bucket as any, 'test.txt'),
            mockFn,
        );

        bucket.file.mockReturnValue(file as any);

        file.createReadStream.mockImplementation(() => {
            const apiError = new ApiError('No such object');
            apiError.code = 404;

            throw apiError;
        });

        const storageProvider = inject('StorageProvider');

        const fileContent =
            await storageProvider.getFileContent(
                'test.txt',
            );

        expect(fileContent).toBeNull();
    });

    it('returns empty list of files', async () => {
        bucket.getFiles.mockResolvedValue([[]]);

        const storageProvider = inject('StorageProvider');

        const files = await storageProvider.listFiles();

        expect(files).toEqual([]);
    });

    it('returns list of files', async () => {
        const rawFile1 = new File(
            bucket as any,
            'test.txt',
        );
        const rawFile2 = new File(
            bucket as any,
            'test2.txt',
        );
        const rawFile3 = new File(
            bucket as any,
            'test3.txt',
        );

        const file1: MockedFile = mockObject(
            rawFile1,
            createMockFactory(vi.fn),
        ) as any;
        const file2: MockedFile = mockObject(
            rawFile2,
            createMockFactory(vi.fn),
        ) as any;
        const file3: MockedFile = mockObject(
            rawFile3,
            createMockFactory(vi.fn),
        ) as any;

        file1.getMetadata = vi.fn();
        file2.getMetadata = vi.fn();
        file3.getMetadata = vi.fn();

        file1.getMetadata.mockResolvedValue([
            {
                metadata: {
                    status: 'uploaded',
                },
            },
        ]);
        file2.getMetadata.mockResolvedValue([
            {
                metadata: {
                    status: 'completed',
                },
            },
        ]);
        file3.getMetadata.mockResolvedValue([
            {
                metadata: {
                    status: 'ivalid',
                },
            },
        ]);

        const readStream1 = new Readable({
            read() {},
        });
        const readStream2 = new Readable({
            read() {},
        });
        const readStream3 = new Readable({
            read() {},
        });

        readStream1.push('test1');
        readStream1.push(null);
        readStream2.push('test2');
        readStream2.push(null);
        readStream3.push('test3');
        readStream3.push(null);

        file1.createReadStream.mockReturnValue(readStream1);
        file2.createReadStream.mockReturnValue(readStream2);
        file3.createReadStream.mockReturnValue(readStream3);

        bucket.file.mockReturnValueOnce(file1 as any);
        bucket.file.mockReturnValueOnce(file2 as any);
        bucket.file.mockReturnValueOnce(file3 as any);

        bucket.getFiles.mockResolvedValue([
            [file1 as any, file2 as any, file3 as any],
        ]);

        const storageProvider = inject('StorageProvider');

        const files = await storageProvider.listFiles();

        expect(files).toEqual([
            {
                fileName: 'test.txt',
                content: 'test1',
                metadata: {
                    status: 'uploaded',
                },
            },
            {
                fileName: 'test2.txt',
                content: 'test2',
                metadata: {
                    status: 'completed',
                },
            },
            {
                fileName: 'test3.txt',
                content: 'test3',
                metadata: {
                    status: 'ivalid',
                },
            },
        ]);

        expect(bucket.file).toHaveBeenNthCalledWith(
            1,
            'test.txt',
        );
        expect(bucket.file).toHaveBeenNthCalledWith(
            2,
            'test2.txt',
        );
        expect(bucket.file).toHaveBeenNthCalledWith(
            3,
            'test3.txt',
        );

        expect(file1.getMetadata).toHaveBeenCalled();
        expect(file2.getMetadata).toHaveBeenCalled();
        expect(file3.getMetadata).toHaveBeenCalled();

        expect(file1.createReadStream).toHaveBeenCalled();
        expect(file2.createReadStream).toHaveBeenCalled();
        expect(file3.createReadStream).toHaveBeenCalled();
    });

    it('filters by metadata status', async () => {
        const rawFile1 = new File(
            bucket as any,
            'test.txt',
        );
        const rawFile2 = new File(
            bucket as any,
            'test2.txt',
        );
        const rawFile3 = new File(
            bucket as any,
            'test3.txt',
        );

        const file1: MockedFile = mockObject(
            rawFile1,
            createMockFactory(vi.fn),
        ) as any;
        const file2: MockedFile = mockObject(
            rawFile2,
            createMockFactory(vi.fn),
        ) as any;
        const file3: MockedFile = mockObject(
            rawFile3,
            createMockFactory(vi.fn),
        ) as any;

        file1.getMetadata = vi.fn();
        file2.getMetadata = vi.fn();
        file3.getMetadata = vi.fn();

        file1.getMetadata.mockResolvedValue([
            {
                metadata: {
                    status: 'uploaded',
                },
            },
        ]);
        file2.getMetadata.mockResolvedValue([{}]);
        file3.getMetadata.mockResolvedValue([
            {
                metadata: {
                    status: 'ivalid',
                },
            },
        ]);

        const readStream1 = new Readable({
            read() {},
        });
        const readStream2 = new Readable({
            read() {},
        });
        const readStream3 = new Readable({
            read() {},
        });

        readStream1.push('test1');
        readStream1.push(null);
        readStream2.push('test2');
        readStream2.push(null);
        readStream3.push('test3');
        readStream3.push(null);

        file1.createReadStream.mockReturnValue(readStream1);
        file2.createReadStream.mockReturnValue(readStream2);
        file3.createReadStream.mockReturnValue(readStream3);

        bucket.file.mockReturnValueOnce(file1 as any);
        bucket.file.mockReturnValueOnce(file2 as any);
        bucket.file.mockReturnValueOnce(file3 as any);

        bucket.getFiles.mockResolvedValue([
            [file1 as any, file2 as any, file3 as any],
        ]);

        const storageProvider = inject('StorageProvider');

        const files = await storageProvider.listFiles(
            'uploaded',
        );

        expect(files).toEqual([
            {
                fileName: 'test.txt',
                content: 'test1',
                metadata: {
                    status: 'uploaded',
                },
            },
        ]);
    });
});
