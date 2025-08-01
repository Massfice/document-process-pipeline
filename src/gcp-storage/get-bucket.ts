import { Bucket, Storage } from '@google-cloud/storage';

/**
 *
 * this function should be tested in e2e tests
 * these tests are not included
 */
export const getBucket = (storage: Storage) => {
    const bucketMap = new Map<string, Bucket>();

    return async (bucketName: string) => {
        if (bucketMap.has(bucketName)) {
            return bucketMap.get(bucketName)!;
        }

        const [buckets] = await storage.getBuckets();

        const bucket = buckets.find(
            (bucket) => bucket.name === bucketName,
        );

        if (!bucket) {
            const [bucket] = await storage.createBucket(
                bucketName,
            );

            bucketMap.set(bucketName, bucket);

            return bucket;
        }

        bucketMap.set(bucketName, bucket);

        return bucket;
    };
};
