import { Direction } from "@minecraft/server";
import { sentry } from "../lib/TypeSentry";
export class Vector3Builder {
    __x__;
    __y__;
    __z__;
    constructor(x, y, z) {
        const nonNaNNumber = sentry.number.nonNaN();
        if (!(nonNaNNumber.test(x) && nonNaNNumber.test(y) && nonNaNNumber.test(z))) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }
        this.__x__ = x;
        this.__y__ = y;
        this.__z__ = z;
    }
    get x() {
        return this.__x__;
    }
    set x(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }
        this.__x__ = value;
    }
    get y() {
        return this.__y__;
    }
    set y(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }
        this.__y__ = value;
    }
    get z() {
        return this.__z__;
    }
    set z(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }
        this.__z__ = value;
    }
    equals(other) {
        if (Vector3Builder.isVector3(other)) {
            return this.__x__ === other.x
                && this.__y__ === other.y
                && this.__z__ === other.z;
        }
        else
            return false;
    }
    operate(a, b, c) {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.x = a(this.x);
            this.y = a(this.y);
            this.z = a(this.z);
        }
        else if (Vector3Builder.isVector3(a) && typeof b === "function" && c === undefined) {
            this.x = b(this.x, a.x);
            this.y = b(this.y, a.y);
            this.z = b(this.z, a.z);
        }
        else if (Vector3Builder.isVector3(a) && Vector3Builder.isVector3(b) && typeof c === "function") {
            this.x = c(this.x, a.x, b.x);
            this.y = c(this.y, a.y, b.y);
            this.z = c(this.z, a.z, b.z);
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }
    add(other) {
        return this.operate(other, (a, b) => a + b);
    }
    subtract(other) {
        return this.add(Vector3Builder.from(other).clone().invert());
    }
    scale(scalar) {
        if (!sentry.number.nonNaN().test(scalar)) {
            throw new TypeError("倍率はNaNでない数値である必要があります");
        }
        return this.operate(component => component * scalar);
    }
    divide(scalar) {
        if (!sentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }
        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }
        return this.operate(component => component / scalar);
    }
    invert() {
        return this.scale(-1);
    }
    dot(other) {
        return this.__x__ * other.x + this.__y__ * other.y + this.__z__ * other.z;
    }
    cross(other) {
        const x1 = this.__x__;
        const y1 = this.__y__;
        const z1 = this.__z__;
        const x2 = other.x;
        const y2 = other.y;
        const z2 = other.z;
        return new Vector3Builder(y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2);
    }
    hadamard(other) {
        return this.clone().operate(other, (a, b) => a * b);
    }
    length(length) {
        if (length === undefined) {
            return Math.sqrt(this.dot(this));
        }
        else if (sentry.number.nonNaN().test(length)) {
            const previous = this.length();
            if (previous === 0) {
                return this;
            }
            return this.operate(component => component / previous * length);
        }
        else {
            throw new TypeError("ベクトルの長さはNaNでない数値である必要があります");
        }
    }
    normalize() {
        return this.length(1);
    }
    getAngleBetween(other) {
        const cos = this.dot(other) / (this.length() * Vector3Builder.from(other).length());
        return Math.acos(cos) * 180 / Math.PI;
    }
    getDistanceTo(other) {
        return Math.hypot(this.__x__ - other.x, this.__y__ - other.y, this.__z__ - other.z);
    }
    getDirectionTo(other) {
        return Vector3Builder.from(other).clone()
            .subtract(this)
            .normalize();
    }
    project(other) {
        const wrapped = Vector3Builder.from(other);
        return wrapped.clone().scale(wrapped.length() * this.length() / wrapped.length() * wrapped.length());
    }
    reject(other) {
        return this.clone().subtract(this.project(other));
    }
    reflect(normal) {
        const dot = this.dot(normal);
        return this.clone().operate(normal, (a, b) => a - 2 * dot * b);
    }
    lerp(other, t) {
        if (!sentry.number.nonNaN().test(t)) {
            throw new TypeError("tはNaNでない数値である必要があります");
        }
        const linear = (a, b) => (1 - t) * a + t * b;
        return new Vector3Builder(linear(this.__x__, other.x), linear(this.__y__, other.y), linear(this.__z__, other.z));
    }
    slerp(other, s) {
        if (!sentry.number.nonNaN().test(s)) {
            throw new TypeError("sはNaNでない数値である必要があります");
        }
        const angle = this.getAngleBetween(other) * Math.PI / 180;
        const p1 = Math.sin(angle * (1 - s)) / Math.sin(angle);
        const p2 = Math.sin(angle * s) / Math.sin(angle);
        const q1 = this.clone().scale(p1);
        const q2 = Vector3Builder.from(other).clone().scale(p2);
        return q1.add(q2);
    }
    clamp(min, max) {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }
    clone() {
        return new Vector3Builder(this.__x__, this.__y__, this.__z__);
    }
    format(format, digits) {
        if (!sentry.number.nonNaN().int().test(digits)) {
            throw new TypeError("桁数はNaNでない整数値である必要があります");
        }
        else if (digits < 0 || digits > 20) {
            throw new RangeError("digitsに使用可能な値は0以上20以下です");
        }
        const cx = this.__x__.toFixed(digits);
        const cy = this.__y__.toFixed(digits);
        const cz = this.__z__.toFixed(digits);
        return format
            .replace(/\$x/g, cx)
            .replace(/\$y/g, cy)
            .replace(/\$z/g, cz)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace("$c", cz)
            .replace(/\$c/g, "");
    }
    toString() {
        return this.format("($x, $y, $z)", 1);
    }
    getRotation2d() {
        const normalized = this.clone().normalize();
        return new DualAxisRotationBuilder(-Math.atan2(normalized.__x__, normalized.__z__) * 180 / Math.PI, -Math.asin(normalized.__y__) * 180 / Math.PI);
    }
    rotate(axis, angle) {
        const angleInRad = angle * Math.PI / 180;
        const sin = Math.sin(angleInRad);
        const cos = Math.cos(angleInRad);
        const { x, y, z } = axis;
        const matrix = [
            [
                cos + x * x * (1 - cos),
                x * y * (1 - cos) - z * sin,
                x * z * (1 - cos) + y * sin
            ],
            [
                y * x * (1 - cos) + z * sin,
                cos + y * y * (1 - cos),
                y * z * (1 - cos) - x * sin
            ],
            [
                z * x * (1 - cos) - y * sin,
                z * y * (1 - cos) + x * sin,
                cos + z * z * (1 - cos)
            ]
        ];
        const a = matrix[0][0] * this.x + matrix[0][1] * this.y + matrix[0][2] * this.z;
        const b = matrix[1][0] * this.x + matrix[1][1] * this.y + matrix[1][2] * this.z;
        const c = matrix[2][0] * this.x + matrix[2][1] * this.y + matrix[2][2] * this.z;
        this.__x__ = a;
        this.__y__ = b;
        this.__z__ = c;
        return this;
    }
    isZero() {
        return this.equals(Vector3Builder.zero());
    }
    toXZ() {
        return { x: this.x, z: this.z };
    }
    static isVector3(value) {
        return sentry.objectOf({
            x: sentry.number.nonNaN(),
            y: sentry.number.nonNaN(),
            z: sentry.number.nonNaN()
        }).test(value);
    }
    static isVectorXZ(value) {
        return sentry.objectOf({
            x: sentry.number.nonNaN(),
            z: sentry.number.nonNaN()
        }).test(value);
    }
    static zero() {
        return new this(0, 0, 0);
    }
    static forward() {
        return new this(0, 0, 1);
    }
    static back() {
        return new this(0, 0, -1);
    }
    static left() {
        return new this(1, 0, 0);
    }
    static right() {
        return new this(-1, 0, 0);
    }
    static up() {
        return new this(0, 1, 0);
    }
    static down() {
        return new this(0, -1, 0);
    }
    static filled(value) {
        return new Vector3Builder(value, value, value);
    }
    static from(arg0, arg1 = 0) {
        if (this.isVector3(arg0)) {
            return new this(arg0.x, arg0.y, arg0.z);
        }
        else if (this.isVectorXZ(arg0)) {
            return new this(arg0.x, arg1, arg0.z);
        }
        else if (Object.values(Direction).includes(arg0)) {
            switch (arg0) {
                case Direction.Up: return Vector3Builder.up();
                case Direction.Down: return Vector3Builder.down();
                case Direction.North: return Vector3Builder.back();
                case Direction.South: return Vector3Builder.forward();
                case Direction.East: return Vector3Builder.left();
                case Direction.West: return Vector3Builder.right();
                default: throw new TypeError("Unknown Direction Value");
            }
        }
        else {
            throw new TypeError("Unknown Type Value");
        }
    }
    static min(a, b) {
        return this.from(a).clone().operate(b, (a, b) => Math.min(a, b));
    }
    static max(a, b) {
        return this.from(a).clone().operate(b, (a, b) => Math.max(a, b));
    }
}
export class DualAxisRotationBuilder {
    __yaw__;
    __pitch__;
    constructor(yaw, pitch) {
        const nonNaNNumber = sentry.number.nonNaN();
        if (!(nonNaNNumber.test(yaw) && nonNaNNumber.test(pitch))) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__yaw__ = yaw;
        this.__pitch__ = pitch;
    }
    get x() {
        return this.pitch;
    }
    set x(value) {
        this.pitch = value;
    }
    get y() {
        return this.yaw;
    }
    set y(value) {
        this.yaw = value;
    }
    get yaw() {
        return this.__yaw__;
    }
    set yaw(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__yaw__ = value;
    }
    get pitch() {
        return this.__pitch__;
    }
    set pitch(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__pitch__ = value;
    }
    equals(other) {
        if (DualAxisRotationBuilder.isVector2(other)) {
            return this.x === other.x
                && this.y === other.y;
        }
        else
            return false;
    }
    operate(a, b, c) {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.y = a(this.y);
            this.x = a(this.x);
        }
        else if (DualAxisRotationBuilder.isVector2(a) && typeof b === "function" && c === undefined) {
            this.y = b(this.y, a.y);
            this.x = b(this.x, a.x);
        }
        else if (DualAxisRotationBuilder.isVector2(a) && DualAxisRotationBuilder.isVector2(b) && typeof c === "function") {
            this.y = c(this.y, a.y, b.y);
            this.y = c(this.y, a.y, b.y);
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }
    add(other) {
        return this.operate(other, (a, b) => a + b);
    }
    subtract(other) {
        return this.add(DualAxisRotationBuilder.from(other).clone().invert());
    }
    scale(scalar) {
        return this.operate(component => component * scalar);
    }
    divide(scalar) {
        if (!sentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }
        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }
        return this.operate(component => component / scalar);
    }
    invert() {
        this.__yaw__ += 180;
        this.__pitch__ *= -1;
        return this;
    }
    clamp(min, max) {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }
    clone() {
        return new DualAxisRotationBuilder(this.__yaw__, this.__pitch__);
    }
    format(format, digits) {
        if (!sentry.number.nonNaN().int().test(digits)) {
            throw new TypeError("桁数はNaNでない整数値である必要があります");
        }
        else if (digits < 0 || digits > 20) {
            throw new RangeError("digitsに使用可能な値は0以上20以下です");
        }
        const cx = this.__yaw__.toFixed(digits);
        const cy = this.__pitch__.toFixed(digits);
        return format
            .replace(/\$yaw/g, cx)
            .replace(/\$pitch/g, cy)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace(/\$c/g, "");
    }
    toString() {
        return this.format("($yaw, $pitch)", 1);
    }
    getDirection3d() {
        return new Vector3Builder(-Math.sin(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180), -Math.sin(this.__pitch__ * Math.PI / 180), Math.cos(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180));
    }
    isZero() {
        return this.equals(DualAxisRotationBuilder.zero());
    }
    static isVector2(value) {
        return sentry.objectOf({
            x: sentry.number.nonNaN(),
            y: sentry.number.nonNaN()
        }).test(value);
    }
    static zero() {
        return new this(0, 0);
    }
    static filled(value) {
        return new this(value, value);
    }
    static from(vector2) {
        return new this(vector2.y, vector2.x);
    }
}
export class TripleAxisRotationBuilder {
    __yaw__;
    __pitch__;
    __roll__;
    constructor(yaw, pitch, roll) {
        const nonNaNNumber = sentry.number.nonNaN();
        if (!(nonNaNNumber.test(yaw) && nonNaNNumber.test(pitch) && nonNaNNumber.test(roll))) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__yaw__ = yaw;
        this.__pitch__ = pitch;
        this.__roll__ = roll;
    }
    get yaw() {
        return this.__yaw__;
    }
    set yaw(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__yaw__ = value;
    }
    get pitch() {
        return this.__pitch__;
    }
    set pitch(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__pitch__ = value;
    }
    get roll() {
        return this.__roll__;
    }
    set roll(value) {
        if (!sentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }
        this.__roll__ = value;
    }
    equals(other) {
        if (other instanceof TripleAxisRotationBuilder) {
            return this.__yaw__ === other.__yaw__
                && this.__pitch__ === other.__pitch__
                && this.__roll__ === other.__roll__;
        }
        else
            return false;
    }
    operate(a, b, c) {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.__yaw__ = a(this.__yaw__);
            this.__pitch__ = a(this.__pitch__);
            this.__roll__ = a(this.__roll__);
        }
        else if (a instanceof TripleAxisRotationBuilder && typeof b === "function" && c === undefined) {
            this.__yaw__ = b(this.__yaw__, a.__yaw__);
            this.__pitch__ = b(this.__pitch__, a.__pitch__);
            this.__roll__ = b(this.__roll__, a.__roll__);
        }
        else if (a instanceof TripleAxisRotationBuilder && b instanceof TripleAxisRotationBuilder && typeof c === "function") {
            this.__yaw__ = c(this.__yaw__, a.__yaw__, b.__yaw__);
            this.__pitch__ = c(this.__pitch__, a.__pitch__, b.__pitch__);
            this.__roll__ = c(this.__roll__, a.__roll__, b.__roll__);
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }
    add(other) {
        return this.operate(other, (a, b) => a + b);
    }
    subtract(other) {
        return this.add(other.clone().invert());
    }
    scale(scalar) {
        if (!sentry.number.nonNaN().test(scalar)) {
            throw new TypeError("倍率はNaNでない数値である必要があります");
        }
        return this.operate(component => component * scalar);
    }
    divide(scalar) {
        if (!sentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }
        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }
        return this.operate(component => component / scalar);
    }
    invert() {
        const rotation = this.getObjectCoordsSystem().back();
        this.__yaw__ = rotation.__yaw__;
        this.__pitch__ = rotation.__pitch__;
        this.__roll__ = rotation.__roll__;
        return this;
    }
    clamp(min, max) {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }
    clone() {
        return new TripleAxisRotationBuilder(this.__yaw__, this.__pitch__, this.__roll__);
    }
    format(format, digits) {
        if (!sentry.number.nonNaN().int().test(digits)) {
            throw new TypeError("桁数はNaNでない整数値である必要があります");
        }
        else if (digits < 0 || digits > 20) {
            throw new RangeError("digitsに使用可能な値は0以上20以下です");
        }
        const cx = this.__yaw__.toFixed(digits);
        const cy = this.__pitch__.toFixed(digits);
        const cz = this.__roll__.toFixed(digits);
        return format
            .replace(/\$yaw/g, cx)
            .replace(/\$pitch/g, cy)
            .replace(/\$roll/g, cz)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace("$c", cz)
            .replace(/\$c/g, "");
    }
    toString() {
        return this.format("($yaw, $pitch, $roll)", 1);
    }
    getDirection3d() {
        return new Vector3Builder(-Math.sin(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180), -Math.sin(this.__pitch__ * Math.PI / 180), Math.cos(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180));
    }
    getObjectCoordsSystem() {
        return new TripleAxisRotationBuilder.ObjectCoordsSystem(this);
    }
    isZero() {
        return this.equals(TripleAxisRotationBuilder.zero());
    }
    static zero() {
        return new this(0, 0, 0);
    }
    static filled(value) {
        return new this(value, value, value);
    }
    static from(vector2, zAngle = 0) {
        return new this(vector2.y, vector2.x, zAngle);
    }
    static ObjectCoordsSystem = class ObjectCoordsSystem {
        __rotation__;
        constructor(rotation) {
            this.__rotation__ = rotation.clone();
        }
        getX() {
            const forward = this.getZ();
            return new Vector3Builder(forward.z, 0, -forward.x)
                .normalize()
                .rotate(forward, this.__rotation__.roll);
        }
        getY() {
            return this.getZ().cross(this.getX());
        }
        getZ() {
            return this.__rotation__.getDirection3d();
        }
        forward() {
            return this.__rotation__.clone();
        }
        back() {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(this.getX().invert(), this.getY());
        }
        left() {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(this.getZ().invert(), this.getY());
        }
        right() {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(this.getZ(), this.getY());
        }
        up() {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(this.getX(), this.getZ().invert());
        }
        down() {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(this.getX(), this.getZ());
        }
        static ofAxes(x, y) {
            const z = x.cross(y);
            return new TripleAxisRotationBuilder(Math.atan2(-z.x, z.z) * 180 / Math.PI, Math.asin(-z.y) * 180 / Math.PI, Math.atan2(x.y, y.y) * 180 / Math.PI);
        }
    };
}
