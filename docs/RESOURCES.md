# Resources

These 56 resources are included in this build. Sources and licenses are in [NOTICE.md](../NOTICE.md).

## [framework]

- `rsg-adminmenu`
- `rsg-ammo`
- `rsg-animations`
- `rsg-appearance`
- `rsg-banking`
- `rsg-barbers`
- `rsg-bathing`
- `rsg-bossmenu`
- `rsg-canteen`
- `rsg-consume`
- `rsg-core`
- `rsg-doorlock`
- `rsg-essentials`
- `rsg-fishing`
- `rsg-gangmenu`
- `rsg-goldclaim`
- `rsg-herbalist`
- `rsg-horses`
- `rsg-hotair`
- `rsg-hunting`
- `rsg-huntingpets`
- `rsg-inventory`
- `rsg-lawman`
- `rsg-loading`
- `rsg-lockpick`
- `rsg-lumberjack`
- `rsg-mdt`
- `rsg-medic`
- `rsg-menubase`
- `rsg-multicharacter`
- `rsg-multijob`
- `rsg-npcs`
- `rsg-playerinfo`
- `rsg-prison`
- `rsg-radialmenu`
- `rsg-railroad`
- `rsg-robbery`
- `rsg-samples`
- `rsg-shops`
- `rsg-spawn`
- `rsg-telegram`
- `rsg-track`
- `rsg-trapdoors`
- `rsg-wagons`
- `rsg-wardrobe`
- `rsg-weaponcomp`
- `rsg-weapons`

## [optional]

- `rsg-discord`

## [standalone]

- `interact-sound`
- `ox_lib`
- `ox_target`
- `oxmysql`
- `pma-voice`
- `PolyZone`
- `rnotify-compat` (written for this build)
- `xsound`

## Downloaded separately

These have no license that allows redistribution, so they aren't in this repository. The txAdmin recipe downloads them from their authors, and [INSTALL.md](INSTALL.md) links them for installing by hand.

| Resource | Effect if it's missing |
|---|---|
| `mapmanager`, `spawnmanager`, `chat`, `hardcap`, `sessionmanager-rdr3` | The server can't run properly |
| `weathersync` | Character selection and spawning fail, because several resources call its exports |
| `rsg-hud` | No on-screen HUD, and hunger, thirst, cleanliness and stress don't work |
| `rsg-fishmonger` | Players can't sell fish |
| `rsg-looting` | Players can't loot bodies |
| `redm-female-fix` | Female characters can show invisible holes |

## Not used

| Was | Why |
|---|---|
| `rNotify` | `rnotify-compat` handles `rsg-multijob`'s notifications |
| `menu_base` | Replaced by `rsg-menubase`. Nothing in this build calls it |
| `chat-redm` | Replaced by `chat` from `cfx-server-data` |
