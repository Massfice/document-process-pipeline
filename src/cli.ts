import yargs from 'yargs';
import { uploadCommand } from './commands/upload';

export const cli = async (args: string[]) => {
    await yargs(args)
        .scriptName('docs-cli')
        .command(uploadCommand)
        .demandCommand(1, 'You need to specify an action')
        .help()
        .parse();
};
