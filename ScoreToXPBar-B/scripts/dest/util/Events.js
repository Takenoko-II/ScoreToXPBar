import { ButtonState, InputButton, system, world } from "@minecraft/server";
import { AbstractEventEmitter, EventHandlerRegistry } from "./EventEmitter";
class UtilEventEmitter extends AbstractEventEmitter {
    registries = {
        sneakButtonReleaseQuickly: new EventHandlerRegistry()
    };
}
export const events = new UtilEventEmitter();
const lastButtonPressedTick = new Map();
world.afterEvents.playerButtonInput.subscribe(event => {
    if (event.button !== InputButton.Sneak)
        return;
    switch (event.newButtonState) {
        case ButtonState.Pressed: {
            lastButtonPressedTick.set(event.player, system.currentTick);
            break;
        }
        case ButtonState.Released: {
            if (system.currentTick - lastButtonPressedTick.get(event.player) <= 1) {
                events.emit("sneakButtonReleaseQuickly", { player: event.player });
            }
            break;
        }
    }
});
events.on("sneakButtonReleaseQuickly", e => {
});
