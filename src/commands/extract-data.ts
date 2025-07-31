import { CommandModule } from 'yargs';
import { inject } from '../di';
import { uploadSchema } from '../schemas/upload.schema';
import { extractDataHelper } from '../extract-data-helper';

export const extractDataCommand: CommandModule = {
    command: 'extract-data',
    describe:
        'Extract data from a file, validate it and save it as metadata',
    builder: (yargs) =>
        yargs
            .option('source', {
                type: 'string',
                describe: 'The source to extract data from',
                demandOption: true,
            })
            .option('return-error', {
                type: 'boolean',
                describe: 'Return error',
                default: false,
            }),
    handler: async (args) => {
        const { source } = uploadSchema.parse(args);

        const storageProvider = inject('StorageProvider');
        const helper = inject('Helper');

        const fileContent =
            await storageProvider.getFileContent(source);

        helper.log('debug', {
            message: 'File content',
            fileContent,
        });

        const data = extractDataHelper(fileContent || '');

        helper.log('debug', {
            message: 'Extracted data',
            data,
        });

        await storageProvider.updateFileMetadata(source, {
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            products: JSON.stringify(data.products),
            total: data.total,
            status: 'validated',
        });
    },
};
