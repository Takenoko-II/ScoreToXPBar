export interface IRange<T> {
    getMin(): T | undefined;
    getMax(): T | undefined;
    within(value: T): boolean;
    clamp(value: T): T;
}
export declare class Range implements IRange<number> {
    protected readonly min: number;
    protected readonly max: number;
    protected constructor(value1: number, value2: number);
    getMin(): number | undefined;
    getMax(): number | undefined;
    within(value: number): boolean;
    clamp(value: number): number;
    static minOnly(min: number): Range;
    static maxOnly(max: number): Range;
    static exactValue(value: number): Range;
    static minMax(value1: number, value2: number): Range;
    static parse(input: string, allowSign: boolean, intOnly: boolean): Range;
}
export declare class FiniteRange extends Range {
    protected constructor(range: Range);
    getMin(): number;
    getMax(): number;
    static minOnly(min: number): FiniteRange;
    static maxOnly(max: number): FiniteRange;
    static minMax(value1: number, value2: number): FiniteRange;
    static exactValue(value: number): FiniteRange;
    static parse(input: string, allowSign: boolean, intOnly: boolean): FiniteRange;
}
export declare class IntRange extends FiniteRange {
    protected constructor(range: FiniteRange);
    within(value: number): boolean;
    clamp(value: number): number;
    toBigInt(): BigIntRange;
    static minOnly(min: number): IntRange;
    static maxOnly(max: number): IntRange;
    static minMax(value1: number, value2: number): IntRange;
    static exactValue(value: number): IntRange;
    static parse(input: string, allowSign: boolean): IntRange;
    static readonly UINT32_MAX_RANGE: IntRange;
    static readonly INT32_MAX_RANGE: IntRange;
}
export declare class BigIntRange implements IRange<bigint> {
    protected readonly min: bigint;
    protected readonly max: bigint;
    protected constructor(value1: bigint, value2: bigint);
    getMin(): bigint;
    getMax(): bigint;
    within(value: bigint): boolean;
    clamp(value: bigint): bigint;
    toPrecisionLost(): IntRange;
    static exactValue(value: bigint): BigIntRange;
    static minMax(value1: bigint, value2: bigint): BigIntRange;
    static parse(input: string, allowSign: boolean): BigIntRange;
    static readonly UINT64_MAX_RANGE: BigIntRange;
    static readonly INT64_MAX_RANGE: BigIntRange;
}
