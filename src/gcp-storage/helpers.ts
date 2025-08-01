import { Bucket, File } from '@google-cloud/storage';
import { initFunctionsFactory } from '../../sdk/di';

export const bucketFunctions =
    initFunctionsFactory<Bucket>()([
        'file',
        'getFiles',
        'upload',
    ]);

export const fileFunctions = initFunctionsFactory<File>()([
    'getMetadata',
    'createReadStream',
    'setMetadata',
]);

export const addNameToBucket = <
    T extends ReturnType<typeof bucketFunctions>,
>(
    bucketName: string,
    bucket: T,
) => {
    return Object.assign(bucket, { name: bucketName });
};

export const addNameToFile = <
    T extends ReturnType<typeof fileFunctions>,
>(
    fileName: string,
    file: T,
) => {
    return Object.assign(file, { name: fileName });
};
