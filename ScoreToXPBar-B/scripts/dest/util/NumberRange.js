export class Range {
    min;
    max;
    constructor(value1, value2) {
        if (Number.isNaN(value1) || Number.isNaN(value2)) {
            throw new TypeError("NaNは範囲の端の値として使用できません");
        }
        this.min = Math.min(value1, value2);
        this.max = Math.max(value1, value2);
    }
    getMin() {
        return Number.isFinite(this.min) ? this.min : undefined;
    }
    getMax() {
        return Number.isFinite(this.max) ? this.max : undefined;
    }
    within(value) {
        return this.min <= value && value <= this.max;
    }
    clamp(value) {
        return Math.max(this.min, Math.min(this.max, value));
    }
    static minOnly(min) {
        return new Range(min, Infinity);
    }
    static maxOnly(max) {
        return new Range(-Infinity, max);
    }
    static exactValue(value) {
        return new Range(value, value);
    }
    static minMax(value1, value2) {
        return new Range(value1, value2);
    }
    static parse(input, allowSign, intOnly) {
        const numberPattern = intOnly ? "\\d+" : "(?:\\d+\.?\\d*|\\.\\d+)";
        const pattern = (allowSign) ? "[+-]?" + numberPattern : numberPattern;
        if (new RegExp("^" + pattern + "$").test(input)) {
            return this.exactValue(Number.parseFloat(input));
        }
        else if (new RegExp("^" + pattern + "\\.\\.$").test(input)) {
            return this.minOnly(Number.parseFloat(input.slice(0, input.length - 2)));
        }
        else if (new RegExp("^\\.\\." + pattern + "$").test(input)) {
            return this.maxOnly(Number.parseFloat(input.slice(2)));
        }
        else if (new RegExp("^" + pattern + "\\.\\." + pattern + "$").test(input)) {
            const [min, max] = input.split(/\.\./g).map(s => Number.parseFloat(s));
            return this.minMax(min, max);
        }
        else
            throw new TypeError("無効な文字列です");
    }
}
export class FiniteRange extends Range {
    constructor(range) {
        const min = range.getMin();
        const max = range.getMax();
        if (min === undefined || max === undefined) {
            throw new TypeError("Finiteな値ではありません");
        }
        super(min, max);
    }
    getMin() {
        return super.getMin();
    }
    getMax() {
        return super.getMax();
    }
    static minOnly(min) {
        return new FiniteRange(new Range(min, Number.MAX_VALUE));
    }
    static maxOnly(max) {
        return new FiniteRange(new Range(Number.MIN_VALUE, max));
    }
    static minMax(value1, value2) {
        return new FiniteRange(super.minMax(value1, value2));
    }
    static exactValue(value) {
        return new FiniteRange(super.exactValue(value));
    }
    static parse(input, allowSign, intOnly) {
        return new FiniteRange(super.parse(input, allowSign, intOnly));
    }
}
export class IntRange extends FiniteRange {
    constructor(range) {
        if (!(Number.isSafeInteger(range.getMin()) && Number.isSafeInteger(range.getMax()))) {
            throw new TypeError("コンストラクタに渡された値が有効な範囲の整数ではありません");
        }
        super(range);
    }
    within(value) {
        if (!Number.isSafeInteger(value)) {
            throw new TypeError("関数に渡された値が有効な範囲の整数ではありません");
        }
        return super.within(value);
    }
    clamp(value) {
        if (value > this.max) {
            return this.max;
        }
        else if (value < this.min) {
            return this.min;
        }
        else
            return Math.round(value);
    }
    toBigInt() {
        return BigIntRange.minMax(BigInt(this.getMin()), BigInt(this.getMax()));
    }
    static minOnly(min) {
        return new IntRange(super.minMax(min, Number.MAX_SAFE_INTEGER));
    }
    static maxOnly(max) {
        return new IntRange(super.minMax(Number.MIN_SAFE_INTEGER, max));
    }
    static minMax(value1, value2) {
        return new IntRange(super.minMax(value1, value2));
    }
    static exactValue(value) {
        return new IntRange(super.exactValue(value));
    }
    static parse(input, allowSign) {
        return new IntRange(super.parse(input, allowSign, true));
    }
    static UINT32_MAX_RANGE = IntRange.minMax(0, 2 ** 32 - 1);
    static INT32_MAX_RANGE = IntRange.minMax(-(2 ** 31), 2 ** 31 - 1);
}
export class BigIntRange {
    min;
    max;
    constructor(value1, value2) {
        if (value1 < value2) {
            this.min = value1;
            this.max = value2;
        }
        else if (value1 > value2) {
            this.min = value2;
            this.max = value1;
        }
        else {
            this.min = value1;
            this.max = this.min;
        }
    }
    getMin() {
        return this.min;
    }
    getMax() {
        return this.max;
    }
    within(value) {
        return this.min <= value && value <= this.max;
    }
    clamp(value) {
        if (value < this.min) {
            return this.min;
        }
        else if (value > this.max) {
            return this.max;
        }
        else {
            return value;
        }
    }
    toPrecisionLost() {
        return IntRange.minMax(Number(this.getMin()), Number(this.getMax()));
    }
    static exactValue(value) {
        return new BigIntRange(value, value);
    }
    static minMax(value1, value2) {
        return new BigIntRange(value1, value2);
    }
    static parse(input, allowSign) {
        const numberPattern = "\\d+";
        const pattern = (allowSign) ? "[+-]?" + numberPattern : numberPattern;
        if (new RegExp("^" + pattern + "$").test(input)) {
            return this.exactValue(BigInt(input));
        }
        else if (new RegExp("^" + pattern + "\\.\\." + pattern + "$").test(input)) {
            const [min, max] = input.split(/\.\./g).map(s => BigInt(s));
            return this.minMax(min, max);
        }
        else
            throw new TypeError("無効な文字列です");
    }
    static UINT64_MAX_RANGE = BigIntRange.minMax(0n, 2n ** 64n - 1n);
    static INT64_MAX_RANGE = BigIntRange.minMax(-(2n ** 63n), 2n ** 63n - 1n);
}
