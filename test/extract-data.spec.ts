import { describe, expect, it, vi } from 'vitest';
import { shell, ShellError } from './helpers/shell';
import { cli } from '../src/cli';
import { inject } from '../src/di';

const cls = shell(cli);

describe('extract-data', () => {
    it('extracts data from a file, validates it and saves it as metadata', async () => {
        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        let content = 'Customer Name: John Doe\n';
        content += '---\n';
        content += 'Customer Email: john.doe@example.com\n';
        content += '---\n';
        content += 'Products: ';
        content += 'Product Name: Product 1\n';
        content += 'Product Price: 100\n';
        content += 'Product Quantity: 1\n';
        content += '...\n';
        content += 'Product Name: Product 2\n';
        content += 'Product Price: 200\n';
        content += 'Product Quantity: 2\n';
        content += '---\n';
        content += 'Total: 500\n';

        storageProvider.getFileContent.mockResolvedValue(
            content,
        );

        await cls(['extract-data', '--source', 'test.txt']);

        expect(
            storageProvider.getFileContent,
        ).toHaveBeenCalledWith('test.txt');

        expect(
            storageProvider.updateFileMetadata,
        ).toHaveBeenCalledWith('test.txt', {
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            products: JSON.stringify([
                {
                    name: 'Product 1',
                    price: '100',
                    quantity: '1',
                },
                {
                    name: 'Product 2',
                    price: '200',
                    quantity: '2',
                },
            ]),
            total: '500',
            status: 'validated',
        });
    });

    it('saves status invalid if the file is not valid', async () => {
        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        let content = 'Customer Name:\n';
        content += '---\n';
        content += 'Customer Email\n';
        content += '---\n';
        content += 'Products: ';
        content += 'Product Name: Product 1\n';
        content += 'Product Quantity: 1\n';
        content += '...\n';
        content += 'Product Name: Product 2\n';
        content += 'Product Price: 200\n';
        content += '...\n';
        content += 'Product Price: 300\n';
        content += 'Product Quantity: 3\n';
        content += '---\n';
        content += 'Total: 500invalid\n';

        storageProvider.getFileContent.mockResolvedValue(
            content,
        );

        await cls(['extract-data', '--source', 'test.txt']);

        expect(
            storageProvider.updateFileMetadata,
        ).toHaveBeenCalledWith('test.txt', {
            status: 'invalid',
            data: JSON.stringify({
                customerName: '',
                total: '500invalid',
                products: [
                    {
                        name: 'Product 1',
                        quantity: '1',
                    },
                    {
                        name: 'Product 2',
                        price: '200',
                    },
                    {
                        price: '300',
                        quantity: '3',
                    },
                ],
            }),
        });
    });

    it('throws an error if the file is not found', async () => {
        expect.assertions(2);

        const storageProvider = inject(
            'StorageProvider',
            vi.fn,
        );

        storageProvider.getFileContent.mockResolvedValue(
            null,
        );

        try {
            await cls([
                'extract-data',
                '--source',
                'test.txt',
            ]);
        } catch (error) {
            if (error instanceof ShellError) {
                const [log] = error.logs;

                expect(log).toEqual(
                    new Error('File not found'),
                );

                expect(
                    storageProvider.updateFileMetadata,
                ).not.toHaveBeenCalled();
            }
        }
    });

    it('returns error if the file is not found', async () => {
        const { logs } = await cls([
            'extract-data',
            '--source',
            'test.txt',
            '--return-error',
        ]);

        const parsed = JSON.parse(logs[0]);

        expect(parsed.error).toBe('File not found');
    });
});
