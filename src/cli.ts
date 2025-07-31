import yargs from 'yargs';
import { uploadCommand } from './commands/upload';
import { extractDataCommand } from './commands/extract-data';

export const cli = async (args: string[]) => {
    await yargs(args)
        .scriptName('docs-cli')
        .command(uploadCommand)
        .command(extractDataCommand)
        .demandCommand(1, 'You need to specify an action')
        .help()
        .parse();
};
