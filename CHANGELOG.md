# Changelog

## 2.4.1-fork.1 (1 November 2026, unreleased)

First release of this fork. These are the changes from the upstream code listed in [NOTICE.md](NOTICE.md).

### Added

- `sql/core.sql`, a database schema written for this build
- `server.cfg.example`, a server config written for this build
- `rnotify-compat`, which shows `rNotify:NotifyLeft` events through `ox_lib` now that `rNotify` isn't included
- Install and resource documentation
- A GitHub Actions workflow that publishes one release per resource
- `dependency 'ox_lib'` in the manifests of `rsg-bathing`, `rsg-canteen`, `rsg-inventory`, `rsg-multicharacter`, `rsg-multijob`, `rsg-npcs`, `rsg-wardrobe` and `rsg-discord`

### Changed

- `rsg-consume` is held at 2.0.2, because 2.0.3 needs items that exist only in rsg-core v3
- `rsg-discord` moved to `resources/[optional]`, because it needs configuring before it can start
- Removed upstream project names from in-game text and log names in `rsg-essentials`, `rsg-shops` and `rsg-track`

### Removed

- All `versionchecker.lua` checks that compared against the upstream version list (each file is now a one-line stub)
- Upstream READMEs and guides from the RSG resources
- `rsg-hud`, `rsg-fishmonger`, `rsg-looting`, `menu_base`, `rNotify`, `chat-redm`, `weathersync` and `redm-female-fix`, because they have no license that allows redistribution
- `cfx-server-data` resources, which are now installed from the official source
- `redm-ipls`, `redm-ymaps`, `Nt_Blackjack` and `Nt_Holdem`, because this build contains RSG resources and what they need only
- `ox_doorlock` and `progressbar`, which no RSG resource uses

`weathersync` is now a required separate download from `kibook/weathersync`.
