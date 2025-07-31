import { z } from 'zod';

export const uploadSchema = z.object({
    source: z.string(),
});
