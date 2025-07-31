import { Storage } from '@google-cloud/storage';
import { ConfigProvider } from './config.provider';
import { configSchema } from '../schemas/config.schema';

export class BucketProvider {
    constructor(
        private readonly configProvider: ConfigProvider<
            typeof configSchema
        >,
    ) {}

    /**
     *
     * this function should be tested in e2e tests
     * these tests are not included
     */
    async getBucket() {
        const { BUCKET_NAME: bucketName } =
            this.configProvider.getConfig();

        const storage = new Storage();

        const [buckets] = await storage.getBuckets();

        const bucket = buckets.find(
            (bucket) => bucket.name === bucketName,
        );

        if (!bucket) {
            const [bucket] = await storage.createBucket(
                bucketName,
            );

            return bucket;
        }

        return bucket;
    }
}
