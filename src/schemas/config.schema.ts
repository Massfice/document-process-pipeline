import { z } from 'zod';

export const configSchema = z.object({
    BUCKET_NAME: z.string(),
});
