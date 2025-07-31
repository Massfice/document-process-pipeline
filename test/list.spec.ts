import { describe, it, expect, vi } from 'vitest';
import { cli } from '../src/cli';
import { shell } from './helpers/shell';
import { inject } from '../src/di';

const cls = shell(cli);

describe('list', () => {
    it('returns list of files', async () => {
        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        storageProvider.listFiles.mockResolvedValue([]);

        const { logs } = await cls(['list']);

        const parsed = JSON.parse(logs[0]);

        expect(parsed).toEqual([]);

        expect(
            storageProvider.listFiles,
        ).toHaveBeenCalledWith(undefined);
    });

    it('filters by status', async () => {
        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        storageProvider.listFiles.mockResolvedValue([
            {
                fileName: 'test.txt',
                content: 'test1',
                metadata: {
                    status: 'uploaded',
                },
            },
        ]);

        const { logs } = await cls([
            'list',
            '--status',
            'uploaded',
        ]);

        const parsed = JSON.parse(logs[0]);

        expect(parsed).toEqual([
            {
                fileName: 'test.txt',
                content: 'test1',
                metadata: {
                    status: 'uploaded',
                },
            },
        ]);

        expect(
            storageProvider.listFiles,
        ).toHaveBeenCalledWith('uploaded');
    });
});
