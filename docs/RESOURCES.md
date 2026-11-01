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

## Removed from this build

These have no license that allows redistribution, so they aren't bundled.

| Was | What to do | Effect if you skip it |
|---|---|---|
| `weathersync` | **Required.** Install `kibook/weathersync` (see [INSTALL.md](INSTALL.md)) | Character selection and spawning fail, because several resources call its exports |
| `rNotify` | Nothing. `rnotify-compat` handles `rsg-multijob`'s notifications | `rsg-inventory` also mentions `rNotify`, and this build hasn't confirmed those messages are covered |
| `rsg-hud` | Add your own HUD | Players have no on-screen HUD |
| `rsg-fishmonger`, `rsg-looting` | Add your own if you want them | Those features are missing |
| `menu_base`, `redm-female-fix` | Add your own if you want them | Nothing in this build calls them by name |
| `chat-redm` | Replaced by `chat` from `cfx-server-data` | Not applicable |
