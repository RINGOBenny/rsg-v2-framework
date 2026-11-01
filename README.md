# RSG v2 Framework

A complete RedM roleplay server base built on RSG Core 2.4.1, with [ox_lib](resources/[standalone]/ox_lib) as a required dependency.

This is an **unofficial, independently maintained fork**. It keeps the 2.x line for servers that want to stay on ox_lib. It isn't affiliated with or endorsed by the original authors, so please don't ask them for support with this build.

## Credits

This framework is the work of RexShack and the Rexshack-RedM project, Phil Mcracken, RMS, Mack, RINGO, the QBCore team and Kakarot, ESX, Overextended and many other contributors. Their copyright and credits are kept in full: see [CREDITS.md](CREDITS.md), and [NOTICE.md](NOTICE.md) for where each resource came from.

## What's included

- **Core:** `rsg-core` 2.4.1, `rsg-inventory`, `rsg-multicharacter`, `rsg-spawn`, `rsg-appearance` and `rsg-menubase`
- **Gameplay:** 40+ resources, including banking, law, medic, horses, wagons, hunting, fishing, railroad and more
- **Required libraries:** `ox_lib`, `ox_target`, `oxmysql`, `pma-voice`, `PolyZone`, `xsound` and `interact-sound`

The full list is in [docs/RESOURCES.md](docs/RESOURCES.md).

## Releases

Every resource has its own release with its own zip, named `<resource>-v<version>`. See the repository's **Releases** page. A new release is created automatically when a resource's version in `fxmanifest.lua` changes.

## Not included

Install these yourself, or use your own replacements:

- **Required, base server resources:** `mapmanager`, `spawnmanager` and `chat` come from [citizenfx/cfx-server-data](https://github.com/citizenfx/cfx-server-data).
- **Required, weather:** [kibook/weathersync](https://github.com/kibook/weathersync). Character selection and spawning need it.
- **Optional, HUD:** this build has no HUD because the version it was based on has no license. See [docs/RESOURCES.md](docs/RESOURCES.md).

## Getting started

Follow [docs/INSTALL.md](docs/INSTALL.md). In short:

1. Install FXServer for RedM and MariaDB.
2. Copy `resources` into your server data folder, then add the base server resources and `weathersync`.
3. Import `sql/core.sql`, then the per-resource SQL files.
4. Copy `server.cfg.example` to `server.cfg` and fill it in.
5. Start the server.

## License

This is a combined work. Each resource keeps its own license file:

- **GPL v3:** RSG resources
- **LGPL:** `ox_lib` and `oxmysql`
- **MIT:** `ox_target`, `pma-voice`, `PolyZone`, `xsound` and `interact-sound`

The repository as a whole is released under [GPL v3](LICENSE). Changes from the upstream code are listed in [CHANGELOG.md](CHANGELOG.md).

The software comes with no warranty. See the license for details.
