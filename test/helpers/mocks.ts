import { vi } from 'vitest';
import {
    dummyObjectFactory,
    createMockFactory,
} from '../../sdk/di';
import {
    bucketFunctions,
    fileFunctions,
    addNameToBucket,
    addNameToFile,
} from '../../src/gcp-storage/helpers';
import { Readable } from 'stream';

const mockFactory = () => createMockFactory(vi.fn);
const dummyObject = dummyObjectFactory(mockFactory);

export const createMockedBucket = (bucketName: string) => {
    const bucket = dummyObject(bucketFunctions);

    return addNameToBucket(bucketName, bucket);
};

export const createMockedFile = (
    fileName: string,
    content: string,
    metaData: Record<string, string>,
) => {
    const file = dummyObject(fileFunctions);

    file.getMetadata.mockResolvedValue([
        {
            metadata: metaData,
        },
    ] as never);

    const readStream = new Readable({
        read() {},
    });

    readStream.push(content);
    readStream.push(null);

    file.createReadStream.mockReturnValue(readStream);

    return addNameToFile(fileName, file);
};
