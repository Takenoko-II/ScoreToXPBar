import { Vector2, Vector3 } from "@minecraft/server";
import { FiniteRange, IntRange, BigIntRange } from "./NumberRange.js";
import { DualAxisRotationBuilder, TripleAxisRotationBuilder } from "./Vector.js";
export interface RandomNumberGenerator {
    int(range: IntRange): number;
    decimal(range: FiniteRange): number;
}
export interface NoiseGenerationOptions {
    frequency: number;
    amplitude: number;
}
export declare class Xorshift32 implements RandomNumberGenerator {
    private x;
    private y;
    private z;
    private w;
    constructor(seed: number);
    next(): number;
    int(range: IntRange): number;
    decimal(range: FiniteRange): number;
    static random(): Xorshift32;
}
export declare class Xorshift128Plus implements RandomNumberGenerator {
    private readonly s;
    constructor(seed0: bigint, seed1: bigint);
    private extract64;
    next(): bigint;
    bigint(range: BigIntRange): bigint;
    int(range: IntRange): number;
    decimal(range: FiniteRange): number;
    static random(): Xorshift128Plus;
}
declare class PerlinNoise {
    private readonly permutation;
    private readonly offset;
    constructor(generator: RandomNumberGenerator);
    private getGridGradients;
    noise3(v: Vector3, options: NoiseGenerationOptions): number;
    noise2(v: Vector2, options: NoiseGenerationOptions): number;
    noise1(v: number, options: NoiseGenerationOptions): number;
    private static fade;
    private static linear;
    private static trilinear;
    private static gradient;
}
export declare class Random {
    private readonly randomNumberGenerator;
    readonly perlinNoiseGenerator: PerlinNoise;
    constructor(randomNumberGenerator: RandomNumberGenerator);
    uuid(): string;
    chance(chance: number): boolean;
    sign(): 1 | -1;
    choice<const T>(list: T[]): T;
    sample<T>(set: Set<T>, count: number): Set<T>;
    boxMuller(): number;
    rotation2(): DualAxisRotationBuilder;
    rotation3(): TripleAxisRotationBuilder;
    weightedChoice<T extends string>(map: Record<T, number>): T;
    shuffledClone<T>(list: T[]): T[];
    static uInt32(): number;
    static uBigInt64(): bigint;
}
export {};
