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

Then install these two required downloads. They aren't bundled because their repositories have no license:

1. Download [citizenfx/cfx-server-data](https://github.com/citizenfx/cfx-server-data) and copy its `resources` folder contents into a `resources/[cfx-default]` folder.
2. Download [kibook/weathersync](https://github.com/kibook/weathersync) into `resources/[standalone]/weathersync`. `rsg-multicharacter`, `rsg-spawn`, `rsg-appearance`, `rsg-horses` and `rsg-essentials` call it directly, so character selection and spawning will fail without it.

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

## Version checks

The built-in RSG version checks are turned off in this build. They compared against a list that now reports v3 and would have told you to upgrade. `ox_lib` and `oxmysql` still check their own upstream versions and may report a newer release.
