class RegistryError extends Error {
}
export class RegistryKey {
    toStoredValue;
    static registryKeyMaxId = 0;
    id = RegistryKey.registryKeyMaxId++;
    constructor(toStoredValue) {
        this.toStoredValue = toStoredValue;
    }
    static create(toStoredValue) {
        if (toStoredValue) {
            return new this(toStoredValue);
        }
        else {
            return new this(x => x);
        }
    }
}
export class ImmutableRegistry {
    __registry__ = new Map();
    key;
    lookup = new RegistryLookup(this.__registry__);
    constructor(keyOrRegistry) {
        if (keyOrRegistry instanceof RegistryKey) {
            this.key = keyOrRegistry;
        }
        else {
            this.key = keyOrRegistry.key;
            keyOrRegistry.__registry__.forEach((v, k) => {
                this.__registry__.set(k, v);
            });
        }
    }
    register(key, value) {
        this.__registry__.set(key, this.key.toStoredValue(value));
    }
    unregister(key) {
        this.__registry__.delete(key);
    }
}
class RegistryLookup {
    __registry__;
    constructor(__registry__) {
        this.__registry__ = __registry__;
    }
    has(name) {
        return this.__registry__.has(name);
    }
    find(name) {
        if (this.__registry__.has(name)) {
            return this.__registry__.get(name);
        }
        else {
            throw new RegistryError("存在しないキーです");
        }
    }
    entries() {
        const array = [];
        this.__registry__.forEach((v, k) => {
            array.push({
                name: k,
                value: v
            });
        });
        return array;
    }
}
export class ImmutableRegistries {
    __registries__ = new Map();
    constructor(registries) {
        if (registries) {
            registries.__registries__.forEach((v, k) => {
                this.__registries__.set(k, v);
            });
        }
    }
    createRegistry(registryKey) {
        this.__registries__.set(registryKey, new ImmutableRegistry(registryKey));
    }
    get(registryKey) {
        if (!this.__registries__.has(registryKey)) {
            this.createRegistry(registryKey);
        }
        return this.__registries__.get(registryKey);
    }
}
export class Registry extends ImmutableRegistry {
    register(key, value) {
        super.register(key, value);
    }
    unregister(key) {
        super.unregister(key);
    }
}
export class Registries extends ImmutableRegistries {
    get(registryKey) {
        return super.get(registryKey);
    }
    withRegistrar(registryKey, callback) {
        callback((key, value) => {
            this.get(registryKey).register(key, value);
        });
    }
}
