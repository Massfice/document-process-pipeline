export type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
        ? K
        : never;
}[keyof T];
