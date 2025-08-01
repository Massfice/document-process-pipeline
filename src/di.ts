import { provide, singleton } from '../sdk/di';
import { configSchema } from './schemas/config.schema';
import { Helper } from './helper';
import { StorageProvider } from './providers/storage.provider';
import { ConfigProvider } from './providers/config.provider';
import { gcpStorageInject } from './gcp-storage';

const configProviderFactory = () => {
    return new ConfigProvider(
        configSchema,
        inject('Helper'),
    );
};

const storageProviderFactory = () => {
    return new StorageProvider(
        inject('ConfigProvider').getConfig().BUCKET_NAME,
        gcpStorageInject('BucketGetter'),
        gcpStorageInject('FileGetter'),
        gcpStorageInject('FilesGetter'),
        inject('Helper'),
    );
};

const helperFactory = () => new Helper();

export const inject = provide({
    ConfigProvider: singleton(configProviderFactory),
    StorageProvider: singleton(storageProviderFactory),
    Helper: singleton(helperFactory),
});
