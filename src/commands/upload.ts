import { CommandModule } from 'yargs';
import { inject } from '../di';
import { uploadSchema } from '../schemas/upload.schema';
import path from 'path';

const filePathHandlers: Record<
    string,
    ((source: string) => Promise<string>) | undefined
> = {
    file: async (source: string) => {
        const filePath = path.join(process.cwd(), source);

        return filePath;
    },
};

export const uploadCommand: CommandModule = {
    command: 'upload',
    describe: 'Upload a file',
    builder: (yargs) =>
        yargs
            .option('source', {
                type: 'string',
                describe: 'The source to upload',
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

        const [type, fileSource] = source.split('://');

        const filePathHandler = filePathHandlers[type];

        if (!filePathHandler && !returnError) {
            throw new Error('Unknown source type');
        } else if (!filePathHandler) {
            helper.return({
                error: 'Unknown source type',
            });

            return;
        }

        const filePath = await filePathHandler(fileSource);

        const fileHandle = await storageProvider.uploadFile(
            filePath,
        );

        helper.return(fileHandle);
    },
};
