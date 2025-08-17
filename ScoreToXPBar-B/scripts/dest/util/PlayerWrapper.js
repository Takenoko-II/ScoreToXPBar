import { EntityComponentTypes, EquipmentSlot, GameMode } from "@minecraft/server";
import { DualAxisRotationBuilder, Vector3Builder } from "./Vector";
export class PlayerWrapper {
    __player__;
    constructor(player) {
        this.__player__ = player;
    }
    getScriptPlayer() {
        if (!this.__player__.isValid) {
            throw new Error("This player is not valid.");
        }
        return this.__player__;
    }
    giveItem(itemStack) {
        const container = this.__player__.getComponent(EntityComponentTypes.Inventory)?.container;
        if (container === undefined) {
            throw new TypeError("Undefined Container");
        }
        const clone = itemStack.clone();
        let remainingAmount = itemStack.amount;
        const maxAmount = itemStack.maxAmount;
        for (let i = 0; i < container.size; i++) {
            const slot = container.getSlot(i);
            if (remainingAmount <= 0)
                break;
            if (!slot.hasItem())
                continue;
            if (slot.isStackableWith(clone)) {
                let addend = Math.min(slot.amount + remainingAmount, maxAmount) - slot.amount;
                remainingAmount -= addend;
                slot.amount += addend;
            }
        }
        if (remainingAmount > 0) {
            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                if (remainingAmount <= 0)
                    break;
                if (slot.hasItem())
                    continue;
                clone.amount = Math.min(remainingAmount, maxAmount);
                slot.setItem(clone);
                remainingAmount -= maxAmount;
            }
        }
        const gameMode = this.__player__.getGameMode();
        if (remainingAmount > 0 && gameMode === GameMode.Survival || gameMode === GameMode.Adventure) {
            clone.amount = remainingAmount;
            const entity = this.__player__.dimension.spawnItem(itemStack, this.__player__.getHeadLocation());
            entity.applyImpulse(Vector3Builder.from(this.__player__.getViewDirection()).scale(0.4));
        }
    }
    hasItem(predicate) {
        const container = this.__player__.getComponent(EntityComponentTypes.Inventory)?.container;
        if (container === undefined) {
            throw new TypeError("Undefined container");
        }
        for (let i = 0; i < container.size; i++) {
            const slot = container.getSlot(i);
            if (!slot.hasItem())
                continue;
            if (predicate(slot.getItem()))
                return true;
        }
        const equippableComponent = this.__player__.getComponent(EntityComponentTypes.Equippable);
        if (equippableComponent === undefined) {
            throw new TypeError("Undefined equipment");
        }
        for (const slotId of Object.values(EquipmentSlot)) {
            if (slotId === EquipmentSlot.Mainhand)
                continue;
            const slot = equippableComponent.getEquipmentSlot(slotId);
            if (!slot.hasItem())
                continue;
            if (predicate(slot.getItem()))
                return true;
        }
        const cursorItem = this.__player__.getComponent(EntityComponentTypes.CursorInventory)?.item;
        if (cursorItem) {
            if (predicate(cursorItem))
                return true;
        }
        return false;
    }
    getPosition() {
        return Vector3Builder.from(this.__player__.location);
    }
    getRotation() {
        return DualAxisRotationBuilder.from(this.__player__.getRotation());
    }
    getEyeLocation() {
        return Vector3Builder.from(this.__player__.getHeadLocation());
    }
    getVelocity() {
        return Vector3Builder.from(this.__player__.getVelocity());
    }
    setVelocity(velocity) {
        const vector = Vector3Builder.from(velocity);
        this.__player__.applyKnockback(vector.length(2.5), vector.y);
    }
    static __wrappers__ = new Map();
    static wrap(player) {
        if (this.__wrappers__.has(player)) {
            return this.__wrappers__.get(player);
        }
        else {
            const instance = new this(player);
            this.__wrappers__.set(player, instance);
            return instance;
        }
    }
}
