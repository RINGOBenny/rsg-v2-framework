const player = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/player');
const inventory = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/inventory');
const horses = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/horses');
const horse = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/horse');
const telegram = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/telegram');
const setmoney = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/setmoney');
const addmoney = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/addmoney');
const removemoney = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/removemoney');
const revive = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/revive');
const giveitem = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/giveitem');
const removeitem = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/removeitem');
const weather = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/weather');
const giveitemall = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands/giveitemall');

module.exports = {
    player,
    inventory,
    horses,
    horse,
    telegram,
    setmoney,
    addmoney,
    removemoney,
    revive,
    giveitem,
    removeitem,
    weather,
    giveitemall,
};
