# ScoreToXPBar

ScoreToXPBar Version 2.4

プレイヤーが持つスコアボードの値をそのプレイヤーの経験値バーに代入します。

## Usage

経験値バーを操作したいプレイヤーにtag「xpBar」を付けると、
そのプレイヤーの経験値バーを/scoreboardから操作できるようになります。
```mcfunction:example
tag @s add xpBar
```

オブジェクト「xpBarMax」を変更することで、経験値バーの最大値を定めることができます。
(最小値: 1, 最大値: 24791)
```mcfunction:example
scoreboard players set @s xpBarValue 100
```

オブジェクト「xpBarValue」を変更することで、経験値バーの値を操作することができます。
(最小値: 0, 最大値: xpBarMax)
```mcfunction:example
scoreboard players add @s xpBarValue 50
```

オブジェクト「xpBarSpeed」を変更することで、経験値バーが動くスピードを変えることができます。
(最小値: 1, 最大値: 20)
```mcfunction:example
scoreboard players set @s xpBarSpeed 14
```

オブジェクト「xpBarLvOverrider」を設定することで、経験値バーに表示するレベルをxpBarValueの値に関係なく操作することができます。
(最小値: 0, 最大値: 24791, 値未設定の状態も可)
```mcfunction:example
scoreboard players set @s xpBarLvOverrider 123
```
またリセットすることで、レベル表示の上書きを解除し、xpBarValueの値に依存した状態に戻すことができます。
```mcfunction:example
scoreboard players reset @s xpBarLvOverrider
```

## Compatible Versions

- 1.20.40

## Note

- xpBarMaxのデフォルト値は1のため、xpBarMaxを変更する前にxpBarValueを変更してしまうと変化が分かりにくい可能性があります。
- scoreboardの値を範囲外の値に設定すると、1tick後に範囲内の数値に強制的に丸められます。
- random.levelupのサウンドが聞こえなくなります。代わりに**random.level.up**を使用することができます。

## License

ScoreToXPBar_2.4 is under [Mit license](https://en.wikipedia.org/wiki/MIT_License).

## Author

- [Takenoko-II](https://github.com/Takenoko-II)
- Twitter: https://twitter.com/Takenoko_4096
- Discord: takenoko_4096 | たけのこII#1119
