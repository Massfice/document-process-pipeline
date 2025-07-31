import yargs from 'yargs';

export const cli = async (args: string[]) => {
    await yargs(args)
        .demandCommand(1, 'You need to specify an action')
        .help()
        .parse();
};
