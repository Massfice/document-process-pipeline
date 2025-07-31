import { describe, expect, it, vi } from 'vitest';
import { shell, ShellError } from './helpers/shell';
import { cli } from '../src/cli';
import { inject } from '../src/di';
import path from 'path';

const cls = shell(cli);

describe('upload', () => {
    it('uploads a file', async () => {
        const filePath = path.join(
            process.cwd(),
            'test.txt',
        );

        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        storageProvider.uploadFile.mockResolvedValue(
            'test.txt',
        );

        const { logs } = await cls([
            'upload',
            '--source',
            'file://test.txt',
        ]);

        expect(logs[logs.length - 1]).toBe('test.txt');

        expect(
            storageProvider.uploadFile,
        ).toHaveBeenCalledWith(filePath);
    });

    it('throws unknown source type error', async () => {
        expect.assertions(1);

        try {
            await cls(['upload', '--source', 'test.txt']);
        } catch (error) {
            if (error instanceof ShellError) {
                const [log] = error.logs;

                expect(log).toEqual(
                    new Error('Unknown source type'),
                );
            }
        }
    });

    it('returns unknown source type error', async () => {
        const { logs } = await cls([
            'upload',
            '--source',
            'test.txt',
            '--return-error',
        ]);

        const parsed = JSON.parse(logs[0]);

        expect(parsed.error).toBe('Unknown source type');
    });

    it('throws "You need to specify an action" error if no commands are provided', async () => {
        expect.assertions(1);

        try {
            await cls([]);
        } catch (error) {
            if (error instanceof ShellError) {
                const [log] = error.logs;

                expect(log).toBe(
                    'You need to specify an action',
                );
            }
        }
    });

    it('throws "You need to specify source" error if no source is provided', async () => {
        expect.assertions(1);

        try {
            await cls(['upload']);
        } catch (error) {
            if (error instanceof ShellError) {
                const [log] = error.logs;

                expect(log).toBe(
                    'Missing required argument: source',
                );
            }
        }
    });
});
