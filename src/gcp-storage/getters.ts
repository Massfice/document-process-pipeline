import { getter } from '../../sdk/di';
import { getBucket } from './get-bucket';
import {
    bucketFunctions,
    fileFunctions,
    addNameToBucket,
    addNameToFile,
} from './helpers';
import { gcpStorageInject } from '.';

export const BucketGetter = getter(
    async (bucketName: string) => {
        const storage = gcpStorageInject('Storage');

        const get = getBucket(storage);

        return addNameToBucket(
            bucketName,
            bucketFunctions(await get(bucketName)),
        );
    },
);
export type BucketGetter = ReturnType<typeof BucketGetter>;

export const FilesGetter = getter(
    async (bucketName: string) => {
        const bucket = await gcpStorageInject(
            'BucketGetter',
        ).get(bucketName);

        const [files] = await bucket.getFiles();

        return files.map((file) =>
            addNameToFile(file.name, fileFunctions(file)),
        );
    },
);
export type FilesGetter = ReturnType<typeof FilesGetter>;

export const FileGetter = getter(
    async (bucketName: string, fileName: string) => {
        const bucket = await gcpStorageInject(
            'BucketGetter',
        ).get(bucketName);

        const file = bucket.file(fileName);

        return addNameToFile(fileName, fileFunctions(file));
    },
);
export type FileGetter = ReturnType<typeof FileGetter>;
