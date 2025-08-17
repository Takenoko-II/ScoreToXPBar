import { ItemStack, Player, Vector3 } from "@minecraft/server";
import { DualAxisRotationBuilder, Vector3Builder } from "./Vector";
export declare class PlayerWrapper {
    private readonly __player__;
    private constructor();
    getScriptPlayer(): Player;
    giveItem(itemStack: ItemStack): void;
    hasItem(predicate: (itemStack: ItemStack) => boolean): boolean;
    getPosition(): Vector3Builder;
    getRotation(): DualAxisRotationBuilder;
    getEyeLocation(): Vector3Builder;
    getVelocity(): Vector3Builder;
    setVelocity(velocity: Vector3): void;
    private static readonly __wrappers__;
    static wrap(player: Player): PlayerWrapper;
}
