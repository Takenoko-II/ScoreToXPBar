export interface EventBase {
}
export interface EventSpecs {
}
export declare enum EventHandlerPriority {
    EARLIEST = 5,
    ERALIER = 4,
    NORMAL = 3,
    LATER = 2,
    LATEST = 1
}
export type EventHandlerRegistries<S extends EventSpecs> = {
    readonly [K in keyof S]: EventHandlerRegistry<S, K>;
};
export declare class EventHandlerRegistry<S extends EventSpecs, K extends keyof S> {
    private readonly handlers;
    private handlerNextId;
    constructor();
    register(callback: (event: S[K]) => void, priority: EventHandlerPriority): number;
    unregister(id: number): boolean;
    private getSortedHandlers;
    fire(event: S[K]): void;
}
export declare abstract class AbstractEventEmitter<S extends EventSpecs> {
    protected abstract readonly registries: EventHandlerRegistries<S>;
    constructor();
    on<T extends keyof S>(event: T, callback: (event: S[T]) => void, priority?: EventHandlerPriority): number;
    once<T extends keyof S>(event: T, callback: (event: S[T]) => void, priority?: EventHandlerPriority): number;
    off<T extends keyof S>(event: T, id: number): boolean;
    emit<T extends keyof S>(name: T, event: S[T]): void;
}
