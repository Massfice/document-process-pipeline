import {
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { inject } from '../src/di';
import { ApiError } from '@google-cloud/storage';
import {
    createMockedBucket,
    createMockedFile,
} from './helpers/mocks';
import { gcpStorageInject } from '../src/gcp-storage';

describe('StorageProvider', () => {
    beforeAll(() => {
        inject(
            'ConfigProvider',
            vi.fn,
        ).getConfig.mockReturnValue({
            BUCKET_NAME: 'test-bucket',
        });
    });

    it('creates a file in the bucket', async () => {
        const mockedBucket =
            createMockedBucket('test-bucket');

        gcpStorageInject(
            'BucketGetter',
            vi.fn,
        ).get.mockResolvedValue(mockedBucket);

        const storageProvider = inject('StorageProvider');

        const fileHandle = await storageProvider.uploadFile(
            '/Users/something/test.txt',
        );

        expect(fileHandle).toBe('test.txt');

        expect(mockedBucket.upload).toHaveBeenCalledWith(
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
        const mockedFile = createMockedFile(
            'text.txt',
            'test',
            {},
        );

        const fileGetter = gcpStorageInject(
            'FileGetter',
            vi.fn,
        );
        fileGetter.get.mockResolvedValue(mockedFile);

        const storageProvider = inject('StorageProvider');

        await storageProvider.updateFileMetadata(
            'text.txt',
            {
                something: '123',
                somethingElse: '456',
            },
        );

        expect(mockedFile.setMetadata).toHaveBeenCalledWith(
            {
                metadata: {
                    something: '123',
                    somethingElse: '456',
                },
            },
        );

        expect(fileGetter.get).toHaveBeenCalledWith(
            'test-bucket',
            'text.txt',
        );
    });

    it('returns file content', async () => {
        const mockedFile = createMockedFile(
            'text.txt',
            'test',
            {},
        );

        gcpStorageInject(
            'FileGetter',
            vi.fn,
        ).get.mockResolvedValue(mockedFile);

        const storageProvider = inject('StorageProvider');

        const fileContent =
            await storageProvider.getFileContent(
                'test.txt',
            );

        expect(fileContent).toBe('test');
    });

    it('returns null if file does not exist', async () => {
        const mockedFile = createMockedFile(
            'text.txt',
            'test',
            {},
        );

        mockedFile.createReadStream.mockImplementation(
            () => {
                const apiError = new ApiError(
                    'No such object',
                );
                apiError.code = 404;

                throw apiError;
            },
        );

        gcpStorageInject(
            'FileGetter',
            vi.fn,
        ).get.mockResolvedValue(mockedFile);

        const storageProvider = inject('StorageProvider');

        const fileContent =
            await storageProvider.getFileContent(
                'test.txt',
            );

        expect(fileContent).toBeNull();
    });

    it('returns empty list of files', async () => {
        gcpStorageInject(
            'FilesGetter',
            vi.fn,
        ).get.mockResolvedValue([]);

        const storageProvider = inject('StorageProvider');

        const files = await storageProvider.listFiles();

        expect(files).toEqual([]);
    });

    it('returns list of files', async () => {
        const mockedFile1 = createMockedFile(
            'test.txt',
            'test1',
            {
                status: 'uploaded',
            },
        );
        const mockedFile2 = createMockedFile(
            'test2.txt',
            'test2',
            {
                status: 'completed',
            },
        );
        const mockedFile3 = createMockedFile(
            'test3.txt',
            'test3',
            {
                status: 'ivalid',
            },
        );

        const filesGetter = gcpStorageInject(
            'FilesGetter',
            vi.fn,
        );
        filesGetter.get.mockResolvedValue([
            mockedFile1,
            mockedFile2,
            mockedFile3,
        ]);
        const fileGetter = gcpStorageInject(
            'FileGetter',
            vi.fn,
        );
        fileGetter.get.mockResolvedValueOnce(mockedFile1);
        fileGetter.get.mockResolvedValueOnce(mockedFile2);
        fileGetter.get.mockResolvedValueOnce(mockedFile3);

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

        expect(filesGetter.get).toHaveBeenCalledWith(
            'test-bucket',
        );

        expect(fileGetter.get).toHaveBeenNthCalledWith(
            1,
            'test-bucket',
            'test.txt',
        );
        expect(fileGetter.get).toHaveBeenNthCalledWith(
            2,
            'test-bucket',
            'test2.txt',
        );
        expect(fileGetter.get).toHaveBeenNthCalledWith(
            3,
            'test-bucket',
            'test3.txt',
        );

        expect(mockedFile1.getMetadata).toHaveBeenCalled();
        expect(mockedFile2.getMetadata).toHaveBeenCalled();
        expect(mockedFile3.getMetadata).toHaveBeenCalled();

        expect(
            mockedFile1.createReadStream,
        ).toHaveBeenCalled();
        expect(
            mockedFile2.createReadStream,
        ).toHaveBeenCalled();
        expect(
            mockedFile3.createReadStream,
        ).toHaveBeenCalled();
    });

    it('filters by metadata status', async () => {
        const mockedFile1 = createMockedFile(
            'test.txt',
            'test1',
            {
                status: 'uploaded',
            },
        );
        const mockedFile2 = createMockedFile(
            'test2.txt',
            'test2',
            {
                status: 'completed',
            },
        );
        const mockedFile3 = createMockedFile(
            'test3.txt',
            'test3',
            {
                status: 'ivalid',
            },
        );

        const filesGetter = gcpStorageInject(
            'FilesGetter',
            vi.fn,
        );
        filesGetter.get.mockResolvedValue([
            mockedFile1,
            mockedFile2,
            mockedFile3,
        ]);
        const fileGetter = gcpStorageInject(
            'FileGetter',
            vi.fn,
        );
        fileGetter.get.mockResolvedValueOnce(mockedFile1);
        fileGetter.get.mockResolvedValueOnce(mockedFile2);
        fileGetter.get.mockResolvedValueOnce(mockedFile3);

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
