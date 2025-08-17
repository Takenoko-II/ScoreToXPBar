import { FiniteRange, IntRange, BigIntRange } from "./NumberRange.js";
import { DualAxisRotationBuilder, TripleAxisRotationBuilder, Vector3Builder } from "./Vector.js";
export class Xorshift32 {
    x = 123456789;
    y = 362436069;
    z = 521288629;
    w;
    constructor(seed) {
        if (!Number.isInteger(seed)) {
            throw new TypeError("シード値は整数である必要があります");
        }
        this.w = seed;
    }
    next() {
        let t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
        return this.w - IntRange.INT32_MAX_RANGE.getMin();
    }
    int(range) {
        const min = range.getMin();
        const max = range.getMax();
        return this.next() % (max - min + 1) + min;
    }
    decimal(range) {
        const min = range.getMin();
        const max = range.getMax();
        return (this.next() / IntRange.UINT32_MAX_RANGE.getMax()) * (max - min) + min;
    }
    static random() {
        return new this(Random.uInt32());
    }
}
export class Xorshift128Plus {
    s = [0n, 0n];
    constructor(seed0, seed1) {
        if (seed0 === 0n && seed1 === 0n) {
            seed1 = 1n;
        }
        const mask = (1n << 64n) - 1n;
        this.s[0] = seed0 & mask;
        this.s[1] = seed1 & mask;
        for (let i = 0; i < 4; i++) {
            this.next(); // 始めの方はシード値が小さいと結果が偏るため
        }
    }
    extract64(value) {
        return value & ((1n << 64n) - 1n);
    }
    next() {
        let s1 = this.s[0];
        let s0 = this.s[1];
        this.s[0] = s0;
        s1 ^= this.extract64(s1 << 23n);
        s1 ^= this.extract64(s1 >> 18n);
        s1 ^= s0;
        s1 ^= this.extract64(s0 >> 5n);
        this.s[1] = s1;
        return this.s[0] + this.s[1];
    }
    bigint(range) {
        let value = this.next();
        return value % (range.getMax() - range.getMin() + 1n) + range.getMin();
    }
    int(range) {
        return Number(this.bigint(range.toBigInt()));
    }
    decimal(range) {
        const digit = 10n;
        const scale = 10n ** digit;
        const intRange = BigIntRange.minMax(0n, scale);
        const ratio = Number(this.bigint(intRange) * scale / intRange.getMax()) / Number(scale);
        return ratio * (range.getMax() - range.getMin()) + range.getMin();
    }
    static random() {
        return new this(Random.uBigInt64(), Random.uBigInt64());
    }
}
class PerlinNoise {
    permutation;
    offset;
    constructor(generator) {
        this.offset = Vector3Builder.zero().operate(() => (generator.int(IntRange.minMax(0, 2 ** 31 - 1)) / (2 ** 31 - 1)) * 256);
        this.permutation = Array(256).fill(0).map(() => generator.int(IntRange.minMax(0, 255)));
        for (let i = 0; i < 256; i++) {
            let index = generator.int(IntRange.minMax(i, 255));
            let old = this.permutation[i];
            this.permutation[i] = this.permutation[index];
            this.permutation[index] = old;
            this.permutation[i + 256] = this.permutation[i];
        }
    }
    getGridGradients(v, AA, AB, BA, BB) {
        return {
            $000: PerlinNoise.gradient(this.permutation[AA], v),
            $100: PerlinNoise.gradient(this.permutation[BA], { x: v.x - 1, y: v.y, z: v.z }),
            $010: PerlinNoise.gradient(this.permutation[AB], { x: v.x, y: v.y - 1, z: v.z }),
            $110: PerlinNoise.gradient(this.permutation[BB], { x: v.x - 1, y: v.y - 1, z: v.z }),
            $001: PerlinNoise.gradient(this.permutation[AA + 1], { x: v.x, y: v.y, z: v.z - 1 }),
            $101: PerlinNoise.gradient(this.permutation[BA + 1], { x: v.x - 1, y: v.y, z: v.z - 1 }),
            $011: PerlinNoise.gradient(this.permutation[AB + 1], { x: v.x, y: v.y - 1, z: v.z - 1 }),
            $111: PerlinNoise.gradient(this.permutation[BB + 1], { x: v.x - 1, y: v.y - 1, z: v.z - 1 })
        };
    }
    noise3(v, options) {
        const vb = Vector3Builder.from(v)
            .scale(options.frequency)
            .add(this.offset);
        const floored = vb.clone().operate(component => Math.floor(component));
        const indices = floored.clone().operate(component => component & 255);
        vb.subtract(floored).operate(component => PerlinNoise.fade(component));
        const xy00 = this.permutation[indices.x] + indices.y;
        const xy10 = this.permutation[indices.x + 1] + indices.y;
        const AA = this.permutation[xy00] + indices.z;
        const AB = this.permutation[xy00 + 1] + indices.z;
        const BA = this.permutation[xy10] + indices.z;
        const BB = this.permutation[xy10 + 1] + indices.z;
        return options.amplitude * PerlinNoise.trilinear(vb, this.getGridGradients(vb, AA, AB, BA, BB));
    }
    noise2(v, options) {
        return this.noise3({ x: v.x, y: v.y, z: 0 }, options);
    }
    noise1(v, options) {
        return this.noise2({ x: v, y: 0 }, options);
    }
    static fade(x) {
        return (6 * x ** 5) - (15 * x ** 4) + (10 * x ** 3);
    }
    static linear(t, a, b) {
        return a + t * (b - a);
    }
    static trilinear(t, range) {
        // X
        const x00 = PerlinNoise.linear(t.x, range.$000, range.$100);
        const x10 = PerlinNoise.linear(t.x, range.$010, range.$110);
        const x01 = PerlinNoise.linear(t.x, range.$001, range.$101);
        const x11 = PerlinNoise.linear(t.x, range.$011, range.$111);
        // Y
        const y0 = PerlinNoise.linear(t.y, x00, x10);
        const y1 = PerlinNoise.linear(t.y, x01, x11);
        // Z
        return PerlinNoise.linear(t.z, y0, y1);
    }
    static gradient(hash, distanceVector) {
        hash &= 15;
        const u = hash < 8 ? distanceVector.x : distanceVector.y;
        const v = hash < 4 ? distanceVector.y : (hash !== 12 && hash !== 14 ? distanceVector.z : distanceVector.x);
        return ((hash & 1) === 0 ? u : -u) + ((hash & 2) === 0 ? v : -v);
    }
}
export class Random {
    randomNumberGenerator;
    perlinNoiseGenerator;
    constructor(randomNumberGenerator) {
        this.randomNumberGenerator = randomNumberGenerator;
        this.perlinNoiseGenerator = new PerlinNoise(randomNumberGenerator);
    }
    uuid() {
        const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('');
        for (let i = 0; i < chars.length; i++) {
            switch (chars[i]) {
                case 'x':
                    chars[i] = this.randomNumberGenerator.int(IntRange.minMax(0, 15)).toString(16);
                    break;
                case 'y':
                    chars[i] = this.randomNumberGenerator.int(IntRange.minMax(8, 11)).toString(16);
                    break;
            }
        }
        return chars.join('');
    }
    chance(chance) {
        return this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1)) < chance;
    }
    sign() {
        return this.chance(0.5) ? 1 : -1;
    }
    choice(list) {
        return list[this.randomNumberGenerator.int(IntRange.minMax(0, list.length - 1))];
    }
    sample(set, count) {
        if (count < 0 || count > set.size) {
            throw new TypeError("countの値は0以上要素数以下である必要があります");
        }
        return new Set(this.shuffledClone([...set])
            .slice(0, count));
    }
    boxMuller() {
        let a, b;
        do {
            a = this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1));
        } while (a === 0);
        do {
            b = this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1));
        } while (b === 1);
        return Math.sqrt(-2 * Math.log(a)) * Math.sin(2 * Math.PI * b);
    }
    rotation2() {
        return new DualAxisRotationBuilder(this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180)), this.randomNumberGenerator.decimal(FiniteRange.minMax(-90, 90)));
    }
    rotation3() {
        return new TripleAxisRotationBuilder(this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180)), this.randomNumberGenerator.decimal(FiniteRange.minMax(-90, 90)), this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180)));
    }
    weightedChoice(map) {
        let sum = 0;
        for (const uncasted of Object.values(map)) {
            const val = uncasted;
            if (!(Number.isSafeInteger(val) && val > 0)) {
                throw new TypeError("重みとなる値は安全な範囲の正の整数である必要があります");
            }
            sum += val;
        }
        const random = this.randomNumberGenerator.int(IntRange.minMax(1, sum));
        let totalWeight = 0;
        for (const [key, weight] of Object.entries(map)) {
            totalWeight += weight;
            if (totalWeight >= random)
                return key;
        }
        throw new TypeError("NEVER HAPPENS");
    }
    shuffledClone(list) {
        const clone = [...list];
        if (list.length <= 1)
            return clone;
        for (let i = clone.length - 1; i >= 0; i--) {
            const current = clone[i];
            const random = this.randomNumberGenerator.int(IntRange.minMax(0, i));
            clone[i] = clone[random];
            clone[random] = current;
        }
        return clone;
    }
    static uInt32() {
        return Math.floor(Math.random() * (2 ** 32));
    }
    static uBigInt64() {
        const high = Math.floor(Math.random() * (2 ** 32));
        const low = Math.floor(Math.random() * (2 ** 32));
        return (BigInt(high) << 32n) | BigInt(low);
    }
}
