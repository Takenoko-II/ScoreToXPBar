import { world, system, Entity } from "@minecraft/server";

//オブジェクトの追加
const objectiveNames = ["xpBarMax", "xpBarValue", "xpBarSpeed"];
for (const objectiveName of objectiveNames) {
    //オブジェクトが既に追加されていれば飛ばす
    if (world.scoreboard.getObjective(objectiveName)) continue;
    world.scoreboard.addObjective(objectiveName, objectiveName);
}

/**
 * targetのscoreboardの値の範囲を制限する関数。
 * 値を持っていなければ範囲の最小値を与える。
 * @param {Entity|string} target 
 * @param {string} objectiveName 
 * @param {{ min: number, max: number }} range 
 */
function limitScore(target, objectiveName, range) {
    const objective = world.scoreboard.getObjective(objectiveName);
    if (!objective) return range.min;
    const scoreValue = objective.getScore(target);
    if (!scoreValue) return range.min;
    const limitedValue = Math.max(range.min, Math.min(range.max, scoreValue));

    target.runCommand(`scoreboard players add @s ${objectiveName} 0`);
    objective.setScore(target, limitedValue);

    return limitedValue;
}

//毎tick実行
system.runInterval(() => {
    for (const player of world.getPlayers({ tags: ["xpBar"] })) {
        //scoreboardの値の範囲を制限
        const max = limitScore(player, "xpBarMax", { min: 1, max: 24791 });
        const value = limitScore(player, "xpBarValue", { min: 0, max: max });
        const speed = limitScore(player, "xpBarSpeed", { min: 1, max: 20 });

        //経験値レベルを129にセット
        player.addLevels(129 - player.level);

        //経験値ポイントを移動スピードで割ったものを加算
        const xpPoint = value * 1002 / max - player.xpEarnedAtCurrentLevel;
        const xpPointMoveSpeed = 20 - speed + 1;
        player.addExperience(xpPoint / xpPointMoveSpeed + xpPoint % xpPointMoveSpeed / 4);

        //経験値レベルをxpBarValueの値にセット
        player.addLevels(value - 129);
    }
});
