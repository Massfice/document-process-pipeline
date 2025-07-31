import { z } from 'zod';
import { Helper } from '../helper';

export class ConfigProvider<
    T extends z.ZodObject<any, any, any, any>,
> {
    constructor(
        private readonly schema: T,
        private readonly helper: Helper,
    ) {}

    getConfig(): z.infer<T> {
        const config = this.schema.parse(process.env);
        this.helper.log('info', {
            message: 'Config retrieved',
            config,
        });

        return config;
    }
}
