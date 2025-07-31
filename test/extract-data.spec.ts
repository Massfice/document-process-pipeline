import { describe, expect, it, vi } from 'vitest';
import { shell } from './helpers/shell';
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
});
