export type PromiseOnly<T> = T extends Promise<infer U>
    ? U
    : never;
