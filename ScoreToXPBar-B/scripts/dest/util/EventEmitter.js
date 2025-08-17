export var EventHandlerPriority;
(function (EventHandlerPriority) {
    EventHandlerPriority[EventHandlerPriority["EARLIEST"] = 5] = "EARLIEST";
    EventHandlerPriority[EventHandlerPriority["ERALIER"] = 4] = "ERALIER";
    EventHandlerPriority[EventHandlerPriority["NORMAL"] = 3] = "NORMAL";
    EventHandlerPriority[EventHandlerPriority["LATER"] = 2] = "LATER";
    EventHandlerPriority[EventHandlerPriority["LATEST"] = 1] = "LATEST";
})(EventHandlerPriority || (EventHandlerPriority = {}));
export class EventHandlerRegistry {
    handlers = new Map();
    handlerNextId = Number.MIN_SAFE_INTEGER;
    constructor() { }
    register(callback, priority) {
        const id = this.handlerNextId++;
        this.handlers.set(id, {
            callback,
            priority
        });
        return id;
    }
    unregister(id) {
        if (this.handlers.has(id)) {
            this.handlers.delete(id);
            return true;
        }
        else
            return false;
    }
    getSortedHandlers() {
        return [...this.handlers.values()].sort((a, b) => {
            return b.priority - a.priority;
        });
    }
    fire(event) {
        this.getSortedHandlers().forEach(handler => {
            handler.callback(event);
        });
    }
}
export class AbstractEventEmitter {
    constructor() { }
    on(event, callback, priority = EventHandlerPriority.NORMAL) {
        return this.registries[event].register(callback, priority);
    }
    once(event, callback, priority = EventHandlerPriority.NORMAL) {
        const id = this.registries[event].register(arg => {
            callback(arg);
            this.off(event, id);
        }, priority);
        return id;
    }
    off(event, id) {
        return this.registries[event].unregister(id);
    }
    emit(name, event) {
        return this.registries[name].fire(event);
    }
}
