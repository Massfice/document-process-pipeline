import { provide, singleton } from '../sdk/di';
import { configSchema } from './schemas/config.schema';
import { Helper } from './helper';
import { StorageProvider } from './providers/storage.provider';
import { ConfigProvider } from './providers/config.provider';
import { BucketProvider } from './providers/bucket.provider';

const configProviderFactory = () => {
    return new ConfigProvider(
        configSchema,
        inject('Helper'),
    );
};

const storageProviderFactory = () => {
    return new StorageProvider(
        inject('BucketProvider'),
        inject('Helper'),
    );
};

const bucketProviderFactory = () => {
    return new BucketProvider(inject('ConfigProvider'));
};

const helperFactory = () => new Helper();

export const inject = provide({
    ConfigProvider: singleton(configProviderFactory),
    StorageProvider: singleton(storageProviderFactory),
    Helper: singleton(helperFactory),
    BucketProvider: singleton(bucketProviderFactory),
});
