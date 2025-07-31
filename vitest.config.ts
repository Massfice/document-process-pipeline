import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.spec.ts'],
        exclude: ['**/._*'],
        environment: 'node',
        globals: true,
    },
});
