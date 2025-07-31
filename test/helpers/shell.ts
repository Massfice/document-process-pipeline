import { vi } from 'vitest';

type ShellFunc = (
    args: string[],
) => Promise<{ logs: string[] }>;

export class ShellError extends Error {
    constructor(
        message: string,
        public readonly logs: string[],
    ) {
        super(message);
    }
}

export const shell: (
    cli: (args: string[]) => Promise<void>,
) => ShellFunc = (cli) => async (args) => {
    const logs: string[] = [];

    const logFunction = (message: string) => {
        if (message === undefined || message === null) {
            return;
        }
        logs.unshift(message);
    };

    const exitSpy = vi
        .spyOn(process, 'exit')
        .mockImplementation((code) => {
            throw new ShellError(
                `Process exited with code: ${code}`,
                logs,
            );
        });

    const logSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(logFunction);
    const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(logFunction);

    try {
        await cli(args);

        exitSpy.mockRestore();
        logSpy.mockRestore();
        errorSpy.mockRestore();

        return { logs };
    } catch (error) {
        exitSpy.mockRestore();
        logSpy.mockRestore();
        errorSpy.mockRestore();

        if (error instanceof ShellError) {
            throw error;
        }

        throw new ShellError(String(error), logs);
    }
};
