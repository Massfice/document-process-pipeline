type ExtractPromiseOverload<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
    (...args: infer A9): infer R9;
    (...args: infer A10): infer R10;
    (...args: infer A11): infer R11;
    (...args: infer A12): infer R12;
    (...args: infer A13): infer R13;
    (...args: infer A14): infer R14;
    (...args: infer A15): infer R15;
    (...args: infer A16): infer R16;
    (...args: infer A17): infer R17;
    (...args: infer A18): infer R18;
    (...args: infer A19): infer R19;
    (...args: infer A20): infer R20;
    (...args: infer A21): infer R21;
    (...args: infer A22): infer R22;
    (...args: infer A23): infer R23;
    (...args: infer A24): infer R24;
    (...args: infer A25): infer R25;
    (...args: infer A26): infer R26;
    (...args: infer A27): infer R27;
    (...args: infer A28): infer R28;
    (...args: infer A29): infer R29;
    (...args: infer A30): infer R30;
    (...args: any[]): any;
}
    ? R1 extends Promise<any>
        ? (...args: A1) => R1
        : R2 extends Promise<any>
        ? (...args: A2) => R2
        : R3 extends Promise<any>
        ? (...args: A3) => R3
        : R4 extends Promise<any>
        ? (...args: A4) => R4
        : R5 extends Promise<any>
        ? (...args: A5) => R5
        : R6 extends Promise<any>
        ? (...args: A6) => R6
        : R7 extends Promise<any>
        ? (...args: A7) => R7
        : R8 extends Promise<any>
        ? (...args: A8) => R8
        : R9 extends Promise<any>
        ? (...args: A9) => R9
        : R10 extends Promise<any>
        ? (...args: A10) => R10
        : R11 extends Promise<any>
        ? (...args: A11) => R11
        : R12 extends Promise<any>
        ? (...args: A12) => R12
        : R13 extends Promise<any>
        ? (...args: A13) => R13
        : R14 extends Promise<any>
        ? (...args: A14) => R14
        : R15 extends Promise<any>
        ? (...args: A15) => R15
        : R16 extends Promise<any>
        ? (...args: A16) => R16
        : R17 extends Promise<any>
        ? (...args: A17) => R17
        : R18 extends Promise<any>
        ? (...args: A18) => R18
        : R19 extends Promise<any>
        ? (...args: A19) => R19
        : R20 extends Promise<any>
        ? (...args: A20) => R20
        : R21 extends Promise<any>
        ? (...args: A21) => R21
        : R22 extends Promise<any>
        ? (...args: A22) => R22
        : R23 extends Promise<any>
        ? (...args: A23) => R23
        : R24 extends Promise<any>
        ? (...args: A24) => R24
        : R25 extends Promise<any>
        ? (...args: A25) => R25
        : R26 extends Promise<any>
        ? (...args: A26) => R26
        : R27 extends Promise<any>
        ? (...args: A27) => R27
        : R28 extends Promise<any>
        ? (...args: A28) => R28
        : R29 extends Promise<any>
        ? (...args: A29) => R29
        : R30 extends Promise<any>
        ? (...args: A30) => R30
        : never
    : never;

type FirstOverload<T> = T extends {
    (...args: infer A1): infer R1;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
    (...args: any[]): any;
}
    ? (...args: A1) => R1
    : never;

export type FirstPromiseOverload<T> =
    ExtractPromiseOverload<T> extends never
        ? FirstOverload<T>
        : ExtractPromiseOverload<T>;
