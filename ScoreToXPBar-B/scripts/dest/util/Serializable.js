import { IntRange } from "./NumberRange.js";
export class SerializationError extends Error {
}
export class Serializer {
    properties = {
        indentationSpaceCount: 4,
        linebreakable: true,
        interpretCircularReference: true,
        hiddenPrototypes: new Set(),
        alwaysHiddenPrototypes: new Set([
            Boolean.prototype,
            Number.prototype,
            BigInt.prototype,
            String.prototype,
            Symbol.prototype,
            Function.prototype
        ])
    };
    get indentationSpaceCount() {
        return this.properties.indentationSpaceCount;
    }
    set indentationSpaceCount(value) {
        if (IntRange.minMax(0, 20).within(value)) {
            throw new TypeError("Indentation space count must not be NaN, must be integer, and must be within range(0, 20)");
        }
        this.properties.indentationSpaceCount = value;
    }
    get linebreakable() {
        return this.properties.linebreakable;
    }
    set linebreakable(value) {
        this.properties.linebreakable = value;
    }
    get interpretCircularReference() {
        return this.properties.interpretCircularReference;
    }
    set interpretCircularReference(value) {
        this.properties.interpretCircularReference = value;
    }
    hidePrototypeOf(clazz) {
        if (clazz.prototype === undefined) {
            throw new TypeError("Passed class object does not have prototype");
        }
        else if (this.properties.alwaysHiddenPrototypes.has(clazz.prototype)) {
            throw new TypeError("Passed class object is always hidden");
        }
        if (!this.properties.hiddenPrototypes.has(clazz.prototype)) {
            this.properties.hiddenPrototypes.add(clazz.prototype);
        }
    }
    unhidePrototypeOf(clazz) {
        if (clazz.prototype === undefined) {
            throw new TypeError("It does not have prototype");
        }
        else if (this.properties.alwaysHiddenPrototypes.has(clazz.prototype)) {
            throw new TypeError("Passed class object is always hidden");
        }
        if (this.properties.hiddenPrototypes.has(clazz.prototype)) {
            this.properties.hiddenPrototypes.delete(clazz);
        }
    }
    isHidden(clazz) {
        return this.properties.hiddenPrototypes.has(clazz) || this.properties.alwaysHiddenPrototypes.has(clazz);
    }
    serialize(value) {
        return this.unknown(new Set(), value, 1);
    }
    newReference(ref, obj) {
        const cSet = new Set(ref);
        cSet.add(obj);
        return cSet;
    }
    getCircularReference() {
        if (this.properties.interpretCircularReference) {
            return Serializer.CIRCULAR_REFERENCE_OBJECT;
        }
        else {
            throw new SerializationError("Circular prototype reference detection");
        }
    }
    getPropertiesOf(object) {
        return Object.getOwnPropertyNames(object);
    }
    getPrototypeOf(object) {
        const prototype = Object.getPrototypeOf(object);
        if (object === prototype) {
            this.getCircularReference();
        }
        if (this.properties.hiddenPrototypes.has(prototype)) {
            return null;
        }
        else {
            return prototype;
        }
    }
    boolean(boolean) {
        return String(boolean);
    }
    number(number) {
        return String(number);
    }
    bigint(bigint) {
        return String(bigint);
    }
    string(string) {
        return Serializer.QUOTE + string + Serializer.QUOTE;
    }
    symbol(symbol) {
        return (symbol.description === undefined || symbol.description.length === 0)
            ? Serializer.SYMBOL
                + Serializer.ARGUMENTS_BRACES[0]
                + Serializer.ARGUMENTS_BRACES[1]
            : Serializer.SYMBOL
                + Serializer.ARGUMENTS_BRACES[0]
                + this.string(symbol.description)
                + Serializer.ARGUMENTS_BRACES[1];
    }
    null() {
        return Serializer.NULL;
    }
    undefined() {
        return Serializer.UNDEFINED;
    }
    indentation(count) {
        return Serializer.WHITESPACE.repeat(this.properties.indentationSpaceCount).repeat(count);
    }
    linebreak() {
        return this.properties.linebreakable ? Serializer.LINEBREAK : Serializer.EMPTY;
    }
    prototype(ref, object, indentation) {
        const prototype = this.getPrototypeOf(object);
        let string = Serializer.EMPTY;
        if (prototype === null) {
            return string;
        }
        let forceAsObject = false;
        if (Array.isArray(object)) {
            forceAsObject = true;
            if (object.length > 0) {
                string += Serializer.COMMA;
            }
        }
        else if (this.getPropertiesOf(object).length > 0) {
            string += Serializer.COMMA;
        }
        string += this.linebreak()
            + this.indentation(indentation)
            + Serializer.PROTOTYPE
            + Serializer.COLON
            + Serializer.WHITESPACE
            + this.object(ref, prototype, indentation + 1, forceAsObject);
        return string;
    }
    function(__function__) {
        const code = __function__.toString();
        if (code.startsWith(Serializer.FUNCTION + Serializer.WHITESPACE)) {
            return Serializer.FUNCTION
                + Serializer.WHITESPACE
                + __function__.name
                + Serializer.ARGUMENTS_BRACES[0]
                + Serializer.ARGUMENTS_BRACES[1]
                + Serializer.WHITESPACE
                + Serializer.CODE;
        }
        else if (code.startsWith(Serializer.ASYNC + Serializer.WHITESPACE)) {
            return Serializer.ASYNC
                + Serializer.WHITESPACE
                + Serializer.FUNCTION
                + Serializer.WHITESPACE
                + __function__.name
                + Serializer.ARGUMENTS_BRACES[0]
                + Serializer.ARGUMENTS_BRACES[1]
                + Serializer.WHITESPACE
                + Serializer.CODE;
        }
        else if (code.startsWith(Serializer.CLASS + Serializer.WHITESPACE)) {
            return Serializer.CLASS
                + Serializer.WHITESPACE
                + __function__.name
                + Serializer.WHITESPACE
                + Serializer.CODE;
        }
        else {
            return __function__.name
                + Serializer.ARGUMENTS_BRACES[0]
                + Serializer.ARGUMENTS_BRACES[1]
                + Serializer.WHITESPACE
                + Serializer.CODE;
        }
    }
    key(key) {
        if (Serializer.UNQUOTED_KEY_PATTERN().test(key)) {
            return key;
        }
        else {
            return this.string(key);
        }
    }
    object(ref, object, indentation, forceAsObject = false) {
        if (Array.isArray(object) && !forceAsObject) {
            return this.array(ref, object, indentation);
        }
        else if (object === null) {
            return this.null();
        }
        let str = Serializer.OBJECT_BRACES[0];
        const keys = this.getPropertiesOf(object);
        const toAdd = new Set();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const v = Reflect.get(object, key);
            let value;
            if (ref.has(v)) {
                value = this.getCircularReference();
            }
            else {
                value = this.unknown(this.newReference(ref, v), v, indentation + 1);
            }
            toAdd.add(v);
            str += this.linebreak()
                + this.indentation(indentation)
                + this.key(key)
                + Serializer.COLON
                + Serializer.WHITESPACE
                + value;
            if (i < keys.length - 1) {
                str += Serializer.COMMA;
            }
        }
        toAdd.forEach(v => ref.add(v));
        const prototype = this.prototype(ref, object, indentation);
        str += prototype;
        if (keys.length > 0 || prototype.length > 0) {
            str += this.linebreak()
                + this.indentation(indentation - 1);
        }
        str += Serializer.OBJECT_BRACES[1];
        return str;
    }
    array(ref, array, indentation) {
        let str = Serializer.ARRAY_BRACES[0];
        const toAdd = new Set();
        for (let i = 0; i < array.length; i++) {
            const v = array[i];
            let value;
            if (ref.has(v)) {
                value = this.getCircularReference();
            }
            else {
                value = this.unknown(this.newReference(ref, v), v, indentation + 1);
            }
            toAdd.add(v);
            str += this.linebreak()
                + this.indentation(indentation)
                + value;
            if (i < array.length - 1) {
                str += Serializer.COMMA;
            }
        }
        toAdd.forEach(v => ref.add(v));
        const prototype = this.prototype(ref, array, indentation);
        str += prototype;
        if (array.length > 0 || prototype.length > 0) {
            str += this.linebreak()
                + this.indentation(indentation - 1);
        }
        str += Serializer.ARRAY_BRACES[1];
        return str;
    }
    map(ref, map, indentation) {
        const obj = {};
        map.forEach((v, k) => {
            if (ref.has(v)) {
                this.getCircularReference();
            }
            Reflect.set(obj, (typeof k === "string") ? k : this.unknown(ref, k, indentation), v);
        });
        return Serializer.MAP
            + Serializer.CLASS_INSTANCE_BRACES[0]
            + this.object(ref, obj, indentation)
            + Serializer.CLASS_INSTANCE_BRACES[1];
    }
    set(ref, set, indentation) {
        const arr = [];
        set.forEach(value => {
            if (ref.has(value)) {
                this.getCircularReference();
            }
            arr.push((typeof value === "string") ? value : this.unknown(ref, value, indentation));
        });
        return Serializer.SET
            + Serializer.WHITESPACE
            + Serializer.CLASS_INSTANCE_BRACES[0]
            + this.array(ref, arr, indentation)
            + Serializer.CLASS_INSTANCE_BRACES[1];
    }
    unknown(ref, target, indentation) {
        if (target === null) {
            return this.null();
        }
        else if (target instanceof Map) {
            return this.map(ref, target, indentation);
        }
        else if (target instanceof Set) {
            return this.set(ref, target, indentation);
        }
        switch (typeof target) {
            case "boolean":
                return this.boolean(target);
            case "number":
                return this.number(target);
            case "bigint":
                return this.bigint(target);
            case "string":
                return this.string(target);
            case "symbol":
                return this.symbol(target);
            case "undefined":
                return this.undefined();
            case "function":
                return this.function(target);
            case "object":
                return this.object(ref, target, indentation);
            default:
                throw new SerializationError("NEVER HAPPENS");
        }
    }
    static ARGUMENTS_BRACES = ["(", ")"];
    static OBJECT_BRACES = ["{", "}"];
    static ARRAY_BRACES = ["[", "]"];
    static CLASS_INSTANCE_BRACES = ["<", ">"];
    static COMMA = ",";
    static COLON = ":";
    static WHITESPACE = " ";
    static QUOTE = "\"";
    static LINEBREAK = "\n";
    static EMPTY = "";
    static CODE = "{ ... }";
    static UNQUOTED_KEY_PATTERN = () => /^[0-9]|[1-9][0-9]*|#?[a-zA-Z][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*$/g;
    static FUNCTION = "function";
    static ASYNC = "async";
    static CLASS = "class";
    static SYMBOL = "symbol";
    static MAP = "Map";
    static SET = "Set";
    static NULL = "null";
    static UNDEFINED = "undefined";
    static PROTOTYPE = "[[Prototype]]";
    static CIRCULAR_REFERENCE_OBJECT = "{ <Circular Reference> }";
}
