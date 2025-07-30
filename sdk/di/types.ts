import { FunctionPropertyNames } from '../types/FunctionPropertyNames';
import { PromiseOnly } from '../types/PromiseOnly';

export interface Mock<
    TArgs extends any[] = any,
    TResult = any,
> {
    (...args: TArgs): TResult;
    mockImplementation(
        fn: (...args: TArgs) => TResult,
    ): void;
    mockImplementationOnce(
        fn: (...args: TArgs) => TResult,
    ): void;
    mockReturnValue(value: TResult): void;
    mockReturnValueOnce(value: TResult): void;
    mockResolvedValue(value: PromiseOnly<TResult>): void;
    mockResolvedValueOnce(
        value: PromiseOnly<TResult>,
    ): void;
    mockRejectedValue(value: any): void;
    mockRejectedValueOnce(value: any): void;
    mockReset(): void;
    mockClear(): void;
    mockRestore(): void;
}

export type Mocked<T = Record<string, any>> = {
    [K in FunctionPropertyNames<T>]: T[K] extends (
        ...args: any[]
    ) => any
        ? Mock<Parameters<T[K]>, ReturnType<T[K]>>
        : never;
};

export type MockFactory = (key: string) => Mock;

export interface ValueFactory<T> {
    (): T;
    mockFactory: MockFactory | null;
}
