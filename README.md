# ScoreToXPBar

読んで字の如く<br>
プレイヤーの経験値バーをscoreboardから操作可能にします

## Usage

### entity-tag `XPBar.Enabled`
> このtagを持たないプレイヤーはこのアドオンの管理下から外れます

### scoreboard-objective `XPBar.Speed`
> 経験値ポイント操作時のアニメーションの速さ (範囲=`1..20`)

### scoreboard-objective `XPBar.MaxValue`
> 経験値ポイントの最大値 (範囲=`1..24791`)<br>
> 右端までバーを貯める為に必要な`XPBar.Value`の値

### scoreboard-objective `XPBar.Value`
> 経験値ポイントの値 (範囲=`0..XPBar.MaxValue`)

### scoreboard-objective `XPBar.Level`
> 経験値レベルの値 (範囲=`0..24791`)<br>
> この値が設定されていないプレイヤーの経験値レベルは`XPBar.Value`に等しくなります<br>
> このobjectiveを用いるとそれを上書きできます

## Compatible Versions

- 1.21.100

## Note

- scoreboardの値を範囲外の値に設定すると、1tick後に強制的に丸められます
- BEはこのような操作をするとレベルアップの音が非常にうるさいので、リソースパックでレベルアップ時にサウンドが再生されないようにしています
- サウンド `random.levelup` 自体は手を加えていないのでそのまま使用可能です

## Author

- [Takenoko-II](https://github.com/Takenoko-II)
- [Twitter](https://twitter.com/Takenoko_4096)
- Discord: takenoko_4096
