import { CommandModule } from 'yargs';
import { inject } from '../di';
import { listSchema } from '../schemas/list.schema';

export const listCommand: CommandModule = {
    command: 'list',
    describe: 'List files',
    builder: (yargs) =>
        yargs.option('status', {
            type: 'string',
            describe: 'Status of the files',
        }),
    handler: async (args) => {
        const { status } = listSchema.parse(args);

        const storageProvider = inject('StorageProvider');
        const helper = inject('Helper');

        const files = await storageProvider.listFiles(
            status,
        );

        helper.log('debug', {
            message: 'Files',
            files,
        });

        helper.return(files);
    },
};
