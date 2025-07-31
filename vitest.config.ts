import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.spec.ts'],
        exclude: ['**/._*'],
        environment: 'node',
        globals: true,
    },
});
