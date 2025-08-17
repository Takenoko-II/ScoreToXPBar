import { Player } from "@minecraft/server";
import { AbstractEventEmitter, EventBase, EventHandlerRegistries, EventSpecs } from "./EventEmitter";
interface UtilSpecs extends EventSpecs {
    readonly sneakButtonReleaseQuickly: SneakButtonReleaseQuickly;
}
export interface SneakButtonReleaseQuickly extends EventBase {
    readonly player: Player;
}
declare class UtilEventEmitter extends AbstractEventEmitter<UtilSpecs> {
    protected readonly registries: EventHandlerRegistries<UtilSpecs>;
}
export declare const events: UtilEventEmitter;
export {};
