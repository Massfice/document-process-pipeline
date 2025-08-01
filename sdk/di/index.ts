import {
    Mock,
    Mocked,
    MockFactory,
    ValueFactory,
    Functions,
} from './types';
import { FunctionPropertyNames } from '../types/FunctionPropertyNames';

export const mockObject = <T extends Record<string, any>>(
    obj: T,
    mockFactory: MockFactory,
): Mocked<T> => {
    const properties = [
        ...Object.getOwnPropertyNames(
            Object.getPrototypeOf(obj),
        ),
        ...Object.keys(obj),
    ];

    properties.forEach((property) => {
        if (
            typeof obj[property] === 'function' &&
            ![
                'constructor',
                '__defineGetter__',
                '__defineSetter__',
                'hasOwnProperty',
                '__lookupGetter__',
                '__lookupSetter__',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toString',
                'valueOf',
                '__proto__',
                'toLocaleString',
            ].includes(property)
        ) {
            (obj as any)[property] = mockFactory(property);
        }
    });

    return obj;
};

export const createMockFactory = (
    mockFn: () => Mock,
): MockFactory => {
    const mockMap = new Map<string, Mock>();

    return (key) => {
        const mock = mockMap.get(key);

        if (mock) {
            return mock;
        }

        const newMock = mockFn();

        mockMap.set(key, newMock);

        return newMock;
    };
};

const createValue = (valueFactory: ValueFactory<any>) => {
    const value = valueFactory();

    if (typeof value !== 'object') {
        return value;
    }

    const { mockFactory } = valueFactory;

    if (!mockFactory) {
        return value;
    }

    return mockObject(value, mockFactory);
};

const initFactories = <T extends Record<string, () => any>>(
    services: T,
): {
    [K in keyof T]: ValueFactory<T[K]>;
} => {
    const factories: Record<string, ValueFactory<any>> = {};

    Object.keys(services).forEach((key) => {
        factories[key] = Object.assign(services[key], {
            mockFactory: null,
        });
    });

    return factories as {
        [K in keyof T]: ValueFactory<T[K]>;
    };
};

export const provide = <
    T extends Record<string, () => any>,
>(
    services: T,
) => {
    const factories = initFactories(services);

    function inject<K extends keyof T>(
        key: K,
    ): ReturnType<T[K]>;

    function inject<K extends keyof T>(
        key: K,
        mockFn: () => Mock,
    ): Mocked<ReturnType<T[K]>>;

    function inject<K extends keyof T>(
        key: K,
        mockFn?: () => Mock,
    ): T[K] | Mocked<T[K]> {
        const valueFactory = factories[key];

        if (mockFn) {
            valueFactory.mockFactory =
                createMockFactory(mockFn);
        }

        return createValue(valueFactory);
    }

    return inject;
};

export const singleton = <T extends () => any>(
    factory: T,
) => {
    let instance: ReturnType<T>;

    return () => {
        if (!instance) {
            instance = factory();
        }

        return instance;
    };
};

export const getter = <T extends (...args: any[]) => any>(
    factory: T,
): (() => { get: T }) =>
    singleton(() => ({ get: factory }));

export const initFunctionsFactory = <
    T extends Record<string, any>,
>() => {
    const factory = <K extends FunctionPropertyNames<T>>(
        requiredFunctions: K[],
    ) => {
        const factory = (
            obj: Partial<T> = {},
        ): Functions<T, K> => {
            requiredFunctions.forEach((key) => {
                if (typeof obj[key] !== 'undefined') {
                    return;
                }

                obj[key] = (() => {
                    throw new Error(
                        `Function ${key.toString()} is not implemented`,
                    );
                }) as any;
            });

            return obj as any;
        };

        return factory;
    };

    return factory;
};

export const dummyObjectFactory = (
    mockFactory: () => MockFactory,
) => {
    const dummyObject = <
        T extends () => Record<
            string,
            (...args: any[]) => any
        >,
    >(
        factory: T,
    ) => {
        const mocksFacktory = mockFactory();

        const mock = mockObject(
            factory() as ReturnType<T>,
            mocksFacktory,
        );

        return mock;
    };

    return dummyObject;
};
