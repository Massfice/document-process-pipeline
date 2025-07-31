export class Helper {
    log(
        severity: 'info' | 'error' | 'warn' | 'debug',
        message:
            | string
            | Record<string, unknown>
            | Array<any>,
    ) {
        const log = this.transformMessage(message);

        console.error(
            `[${severity.toUpperCase()}]: ${log}`,
        );
    }

    return(
        message:
            | string
            | Record<string, unknown>
            | Array<any>,
    ) {
        const log = this.transformMessage(message);

        console.log(log);
    }

    private transformMessage(
        message:
            | string
            | Record<string, unknown>
            | Array<any>,
    ) {
        if (typeof message === 'object') {
            return JSON.stringify(message);
        }

        if (Array.isArray(message)) {
            return JSON.stringify(message);
        }

        return message;
    }
}
