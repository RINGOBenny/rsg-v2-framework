const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

const RSGCore = global.exports['rsg-core'].GetCoreObject();

module.exports = async (message, args) => {
    // Usage: /giveitemall <type> <item> <amount>
    // type: online or all
    // item: item name
    // amount: quantity

    if (args.length < 3) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Usage')
            .setDescription('**Usage:** `/giveitemall <type> <item> <amount>`\n\n**Type:**\n`online` - Give to all online players\n`all` - Give to all players (including offline)')
            .addField('Example', '`/giveitemall online water 5`')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const type = args[0].toLowerCase();
    const itemName = args[1].toLowerCase();
    const amount = parseInt(args[2]);

    // Validate type
    if (type !== 'online' && type !== 'all') {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Type')
            .setDescription('Type must be either `online` or `all`')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Amount')
            .setDescription('Amount must be a positive number')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    try {
        let successCount = 0;
        let failCount = 0;
        const results = [];

        if (type === 'online') {
            // Give to all online players
            const players = RSGCore.Functions.GetPlayers();
            
            if (!players || players.length === 0) {
                const embed = new MessageEmbed()
                    .setColor(config.colors.warning)
                    .setTitle('⚠️ No Players Online')
                    .setDescription('There are no players currently online.')
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }

            for (const playerId of players) {
                const Player = RSGCore.Functions.GetPlayer(playerId);
                if (Player) {
                    try {
                        Player.Functions.AddItem(itemName, amount);
                        TriggerClientEvent('rsg-inventory:client:ItemBox', playerId, RSGCore.Shared.Items[itemName], 'add', amount);
                        successCount++;
                        results.push(`✅ ${Player.PlayerData.charinfo.firstname} ${Player.PlayerData.charinfo.lastname} (${Player.PlayerData.citizenid})`);
                    } catch (error) {
                        failCount++;
                        results.push(`❌ ${Player.PlayerData.charinfo.firstname} ${Player.PlayerData.charinfo.lastname} (${Player.PlayerData.citizenid})`);
                    }
                }
            }

            const embed = new MessageEmbed()
                .setColor(config.colors.success)
                .setTitle('📦 Item Given to Online Players')
                .setDescription(`Given **${amount}x ${itemName}** to all online players`)
                .addField('Statistics', `✅ Success: ${successCount}\n❌ Failed: ${failCount}\n👥 Total Online: ${players.length}`)
                .addField('Results', results.slice(0, 10).join('\n') + (results.length > 10 ? `\n... and ${results.length - 10} more` : ''))
                .setFooter({ text: `Executed by ${message.author.tag}` })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });

        } else if (type === 'all') {
            // Give to all players (including offline) via database
            const allPlayers = await utils.fetchAll('SELECT citizenid, charinfo FROM players', []);
            
            if (!allPlayers || allPlayers.length === 0) {
                const embed = new MessageEmbed()
                    .setColor(config.colors.warning)
                    .setTitle('⚠️ No Players Found')
                    .setDescription('No players found in the database.')
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }

            for (const playerData of allPlayers) {
                const citizenid = playerData.citizenid;
                
                // Try to get online player first
                const Player = RSGCore.Functions.GetPlayerByCitizenId(citizenid);
                
                if (Player) {
                    // Player is online, use normal method
                    try {
                        Player.Functions.AddItem(itemName, amount);
                        TriggerClientEvent('rsg-inventory:client:ItemBox', Player.PlayerData.source, RSGCore.Shared.Items[itemName], 'add', amount);
                        successCount++;
                        results.push(`✅ ${Player.PlayerData.charinfo.firstname} ${Player.PlayerData.charinfo.lastname} (Online)`);
                    } catch (error) {
                        failCount++;
                        results.push(`❌ ${Player.PlayerData.charinfo.firstname} ${Player.PlayerData.charinfo.lastname} (Online)`);
                    }
                } else {
                    // Player is offline, add directly to database
                    try {
                        const charinfo = JSON.parse(playerData.charinfo);
                        
                        // Get current items
                        const itemsResult = await utils.fetchSingle('SELECT items FROM players WHERE citizenid = ?', [citizenid]);
                        let items = [];
                        
                        if (itemsResult && itemsResult.items) {
                            try {
                                items = JSON.parse(itemsResult.items);
                            } catch (e) {
                                items = [];
                            }
                        }
                        
                        // Find if item already exists
                        let itemFound = false;
                        for (let i = 0; i < items.length; i++) {
                            if (items[i] && items[i].name === itemName) {
                                items[i].amount += amount;
                                itemFound = true;
                                break;
                            }
                        }
                        
                        // If item not found, add to first empty slot
                        if (!itemFound) {
                            let added = false;
                            for (let i = 0; i < items.length; i++) {
                                if (!items[i] || items[i].name === null) {
                                    items[i] = {
                                        name: itemName,
                                        amount: amount,
                                        info: {},
                                        slot: i + 1
                                    };
                                    added = true;
                                    break;
                                }
                            }
                            
                            // If no empty slot, add to end
                            if (!added) {
                                items.push({
                                    name: itemName,
                                    amount: amount,
                                    info: {},
                                    slot: items.length + 1
                                });
                            }
                        }
                        
                        // Update database
                        await utils.execute('UPDATE players SET items = ? WHERE citizenid = ?', [JSON.stringify(items), citizenid]);
                        
                        successCount++;
                        results.push(`✅ ${charinfo.firstname} ${charinfo.lastname} (Offline)`);
                    } catch (error) {
                        failCount++;
                        const charinfo = JSON.parse(playerData.charinfo);
                        results.push(`❌ ${charinfo.firstname} ${charinfo.lastname} (Offline)`);
                    }
                }
            }

            const embed = new MessageEmbed()
                .setColor(config.colors.success)
                .setTitle('📦 Item Given to All Players')
                .setDescription(`Given **${amount}x ${itemName}** to all players (online and offline)`)
                .addField('Statistics', `✅ Success: ${successCount}\n❌ Failed: ${failCount}\n👥 Total Players: ${allPlayers.length}`)
                .addField('Results Preview', results.slice(0, 10).join('\n') + (results.length > 10 ? `\n... and ${results.length - 10} more` : ''))
                .setFooter({ text: `Executed by ${message.author.tag}` })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('[rsg-discord] Error in giveitemall command:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Command Error')
            .setDescription(`Failed to give items: ${error.message}`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};
