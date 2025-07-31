import { z } from 'zod';

export const listSchema = z.object({
    status: z.string().optional(),
});
