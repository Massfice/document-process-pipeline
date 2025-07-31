import { CommandModule } from 'yargs';
import { inject } from '../di';
import { uploadSchema } from '../schemas/upload.schema';
import {
    extractDataHelper,
    validateDataHelper,
} from '../extract-data-helper';

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
        const { source, returnError } =
            uploadSchema.parse(args);

        const storageProvider = inject('StorageProvider');
        const helper = inject('Helper');

        const fileContent =
            await storageProvider.getFileContent(source);

        helper.log('debug', {
            message: 'File content',
            fileContent,
        });

        if (!fileContent && !returnError) {
            throw new Error('File not found');
        } else if (!fileContent) {
            helper.return({
                error: 'File not found',
            });
            return;
        }

        const data = extractDataHelper(fileContent);

        helper.log('debug', {
            message: 'Extracted data',
            data,
        });

        const validatedData = validateDataHelper(data);

        if (!validatedData) {
            await storageProvider.updateFileMetadata(
                source,
                {
                    status: 'invalid',
                    data: JSON.stringify(data),
                },
            );
            return;
        }

        await storageProvider.updateFileMetadata(source, {
            customerName: validatedData.customerName,
            customerEmail: validatedData.customerEmail,
            products: JSON.stringify(
                validatedData.products,
            ),
            total: validatedData.total,
            status: 'validated',
        });
    },
};
