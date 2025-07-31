import { z } from 'zod';

const isNumericString = (val: string) =>
    /^\d+(\.\d+)?$/.test(val);
const isIntegerString = (val: string) => /^\d+$/.test(val);

export const docSchema = z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email().min(1),
    products: z.array(
        z.object({
            name: z.string().min(1),
            price: z
                .string()
                .min(1)
                .refine(isNumericString, {
                    message:
                        'Price must be a numeric string',
                }),
            quantity: z
                .string()
                .min(1)
                .refine(isIntegerString, {
                    message:
                        'Quantity must be a numeric string',
                }),
        }),
    ),
    total: z.string().min(1).refine(isNumericString, {
        message: 'Total must be a numeric string',
    }),
});
