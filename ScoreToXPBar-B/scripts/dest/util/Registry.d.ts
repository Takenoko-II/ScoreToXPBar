export declare class RegistryKey<K, I, O> {
    readonly toStoredValue: (i: I) => O;
    private static registryKeyMaxId;
    readonly id: number;
    private constructor();
    static create<K, T, U>(toStoredValue: (i: T) => U): RegistryKey<K, T, U>;
    static create<K, T>(): RegistryKey<K, T, T>;
}
export declare class ImmutableRegistry<K, I, O> {
    private readonly __registry__;
    private readonly key;
    readonly lookup: RegistryLookup<K, O>;
    constructor(key: RegistryKey<K, I, O>);
    constructor(registry: ImmutableRegistry<K, I, O>);
    protected register(key: K, value: I): void;
    protected unregister(key: K): void;
}
interface RegistryEntry<K, O> {
    readonly name: K;
    readonly value: O;
}
declare class RegistryLookup<K, O> {
    private readonly __registry__;
    constructor(__registry__: Map<K, O>);
    has(name: K): boolean;
    find(name: K): O;
    entries(): RegistryEntry<K, O>[];
}
export declare class ImmutableRegistries {
    private readonly __registries__;
    constructor();
    constructor(registries: ImmutableRegistries);
    private createRegistry;
    get<K, I, O>(registryKey: RegistryKey<K, I, O>): ImmutableRegistry<K, I, O>;
}
export declare class Registry<K, I, O> extends ImmutableRegistry<K, I, O> {
    register(key: K, value: I): void;
    unregister(key: K): void;
}
export declare class Registries extends ImmutableRegistries {
    get<K, I, O>(registryKey: RegistryKey<K, I, O>): Registry<K, I, O>;
    withRegistrar<K, I, O>(registryKey: RegistryKey<K, I, O>, callback: (register: (key: K, value: I) => void) => void): void;
}
export {};
