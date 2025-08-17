import { world, system } from "@minecraft/server";
import { IntRange } from "./util/NumberRange";
class XPBar {
    player;
    constructor(player) {
        this.player = player;
        XPBar.cache.set(player, this);
    }
    restrict(name, range, nullable) {
        const objective = world.scoreboard.getObjective(name);
        if (objective === undefined)
            return nullable ? null : range.getMin();
        const scoreValue = objective.getScore(this.player);
        if (scoreValue === undefined)
            return nullable ? null : range.getMin();
        const restrictedValue = range.clamp(scoreValue);
        objective.setScore(this.player, restrictedValue);
        return restrictedValue;
    }
    restrictScoreValues() {
        const speed = this.restrict(XPBar.SCOREBOARD_SPEED, IntRange.minMax(1, 20), false);
        const maxValue = this.restrict(XPBar.SCOREBOARD_MAX_VALUE, IntRange.minMax(1, 24791), false);
        const value = this.restrict(XPBar.SCOREBOARD_VALUE, IntRange.minMax(0, maxValue), false);
        const level = this.restrict(XPBar.SCOREBOARD_LEVEL, IntRange.minMax(0, 24791), true);
        return { speed, maxValue, value, level };
    }
    tick() {
        // scoreboardの値の範囲を制限
        const { speed, maxValue, value, level } = this.restrictScoreValues();
        //経験値レベルを129にセット
        this.player.addLevels(129 - this.player.level);
        //経験値ポイントを移動スピードで割ったものを加算
        const xpPoint = value * 1002 / maxValue - this.player.xpEarnedAtCurrentLevel;
        const xpPointMovementSpeed = 20 - speed + 1;
        this.player.addExperience(xpPoint / xpPointMovementSpeed + xpPoint % xpPointMovementSpeed / 4);
        //経験値レベルをxpBarValueの値にセット
        this.player.addLevels((level ?? value) - 129);
    }
    static cache = new Map();
    static destruct(player) {
        if (XPBar.cache.has(player)) {
            XPBar.cache.delete(player);
        }
    }
    static get(player) {
        if (XPBar.cache.has(player)) {
            return XPBar.cache.get(player);
        }
        else {
            return new XPBar(player);
        }
    }
    static SCOREBOARD_SPEED = "XPBar.Speed";
    static SCOREBOARD_MAX_VALUE = "XPBar.MaxValue";
    static SCOREBOARD_VALUE = "XPBar.Value";
    static SCOREBOARD_LEVEL = "XPBar.Level";
    static TAG_ENABLED = "XPBar.Enabled";
    static {
        world.beforeEvents.playerLeave.subscribe(event => {
            XPBar.destruct(event.player);
        });
        world.afterEvents.worldLoad.subscribe(() => {
            for (const name of [XPBar.SCOREBOARD_SPEED, XPBar.SCOREBOARD_MAX_VALUE, XPBar.SCOREBOARD_VALUE, XPBar.SCOREBOARD_LEVEL]) {
                if (world.scoreboard.getObjective(name) === undefined) {
                    world.scoreboard.addObjective(name);
                }
            }
        });
        system.runInterval(() => {
            for (const player of world.getPlayers({ tags: [XPBar.TAG_ENABLED] })) {
                XPBar.get(player).tick();
            }
        });
    }
}
console.log(`Class ${XPBar.name} was successfully loaded`);
