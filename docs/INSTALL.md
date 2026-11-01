# Installing RSG v2 Framework

The easiest way to install is the txAdmin recipe. On txAdmin's setup page, choose **Remote URL Template** and paste:

```
https://raw.githubusercontent.com/RINGOBenny/rsg-v2-framework/main/recipe/rsg-v2.yaml
```

It does steps 1 to 3 below for you. Afterwards, add your license identifier to `server.cfg` if you want owner access, and see step 4 for optional resources.

The rest of this guide is for installing by hand.

## Requirements

- FXServer for RedM, on a build with Node 22 support (needed by `oxmysql` 2.14.1)
- MariaDB or MySQL
- A Cfx.re server license key

## 1. Copy the resources

Copy the `resources` folder from this repository into your server data folder.

Then install these downloads. They aren't bundled because their repositories have no license, so they come directly from their authors. Use these exact commits:

| Download | Put it in | Why it's needed |
|---|---|---|
| [citizenfx/cfx-server-data](https://github.com/citizenfx/cfx-server-data/tree/e265cb251c88260533c847d4a1a2838c7d828a66) | Copy the contents of its `resources` folder into `resources/[cfx-default]` | Base server resources. Later commits no longer include `chat`, `hardcap` or `sessionmanager-rdr3` |
| [kibook/weathersync](https://github.com/kibook/weathersync/tree/9c8d3c49d8c0180a78c145d2a8e8ce73a1920bd0) | `resources/[standalone]/weathersync` | Character selection and spawning fail without it |
| [rsg-hud](https://github.com/Rexshack-RedM/rsg-hud/tree/7bcf5afd5568c5529c90ca91a3a94b4181dc40df) | `resources/[framework]/rsg-hud` | The on-screen HUD. It also runs hunger, thirst, cleanliness and stress, so eating, drinking and washing break without it |
| [rsg-fishmonger](https://github.com/Rexshack-RedM/rsg-fishmonger/tree/6f55d7955aa26e9db83cc545f72437ec5ac014a6) | `resources/[framework]/rsg-fishmonger` | Selling fish |
| [rsg-looting](https://github.com/Rexshack-RedM/rsg-looting/tree/be25d38b4c78dcb737c7569896421839337920cc) | `resources/[framework]/rsg-looting` | Looting bodies |
| [redm-female-fix](https://github.com/Popisek/redm-female-fix/tree/1cff9742a7130154c242b232f18ec7c0fd5b821b) | `resources/[standalone]/redm-female-fix` | Fixes invisible holes on female characters |

Remove the folder name's commit suffix after unzipping, so the folder names match the table. To stop `rsg-hud`, `rsg-fishmonger` and `rsg-looting` reporting v3 as an update, empty their `server/versionchecker.lua` files.

## 2. Create the database

Create an empty database, then import `sql/core.sql`.

Next, import the SQL file for each resource you plan to run:

| Resource | File |
|---|---|
| `rsg-adminmenu` | `resources/[framework]/rsg-adminmenu/install.sql` |
| `rsg-ammo` | `resources/[framework]/rsg-ammo/rsg-ammo.sql` |
| `rsg-animations` | `resources/[framework]/rsg-animations/rsg-animations.sql` |
| `rsg-gangmenu` | `resources/[framework]/rsg-gangmenu/rsg-gangmenu.sql` |
| `rsg-goldclaim` | `resources/[framework]/rsg-goldclaim/install/rsg-goldclaim.sql` |
| `rsg-horses` | `resources/[framework]/rsg-horses/installation/setup.sql` |
| `rsg-huntingpets` | `resources/[framework]/rsg-huntingpets/installation/rsg_huntingpets.sql` |
| `rsg-lumberjack` | `resources/[framework]/rsg-lumberjack/install/database.sql` |
| `rsg-mdt` | `resources/[framework]/rsg-mdt/sql/mdt.sql` |
| `rsg-railroad` | `resources/[framework]/rsg-railroad/install/rsg_railroad_full.sql` |
| `rsg-samples` | `resources/[framework]/rsg-samples/install/rsg-samples.sql` |
| `rsg-trapdoors` | `resources/[framework]/rsg-trapdoors/rsg_trapdoors.sql` |
| `rsg-wagons` | `resources/[framework]/rsg-wagons/installation/rsg-wagons.sql` |
| `rsg-weaponcomp` | `resources/[framework]/rsg-weaponcomp/database.sql` |

Some resources also create their own tables on first start.

## 3. Configure the server

Copy `server.cfg.example` to `server.cfg` in your server data folder, then replace every `CHANGE_ME` value. Keep `server.cfg` private, because it holds your license key and database password.

To give yourself owner access, uncomment the last line and add your license identifier.

## 4. Optional resources

`resources/[optional]/rsg-discord` doesn't start by default. To use it:

1. Copy `config.example.js` to `config.js` and add your Discord bot token and guild ID.
2. Add `ensure rsg-discord` to `server.cfg`.

## 5. Start the server

Start FXServer with your `server.cfg`. `ox_lib` must start before `rsg-core`, and the example config already does this.

The first start takes about 2 minutes while `chat` and `sessionmanager-rdr3` build, and it can use a lot of CPU. You may see `Couldn't start resource`, `yarn` warnings and a brief `Server is not responding` during this. Wait for `Started resource chat` before judging the startup. Later starts skip the build.

To join from another PC, use the server's public IP in RedM's F8 console, for example `connect 203.0.113.10:30120`. `localhost` only works on the server itself.

## Version checks

The built-in RSG version checks are turned off in this build. They compared against a list that now reports v3 and would have told you to upgrade. `ox_lib` and `oxmysql` still check their own upstream versions and may report a newer release.
