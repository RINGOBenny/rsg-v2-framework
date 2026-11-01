const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

// Get RSGCore object
const RSGCore = global.exports['rsg-core'].GetCoreObject();

module.exports = async (message, args) => {
    if (args.length < 3) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.removeitem.usage}\n\n**Examples:**\n/removeitem 1 water 5\n/removeitem ABC123 lockpick 10\n/removeitem 1 weapon_revolver_cattleman 1`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
    const itemName = args[1].toLowerCase();
    const amount = parseInt(args[2]);

    // Validate amount
    if (isNaN(amount) || amount < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Amount')
            .setDescription('Amount must be a positive number.')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Get player
    const player = utils.getPlayer(identifier);

    if (!player) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Player Not Found')
            .setDescription(`No player found with identifier: **${identifier}**`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const playerData = player.PlayerData;
    const playerId = player.PlayerData.source;

    try {
        // Check if player has the item
        const hasItem = player.Functions.GetItemByName(itemName);
        
        if (!hasItem) {
            const itemLabel = RSGCore.Shared.Items[itemName]?.label || itemName;
            
            const embed = new MessageEmbed()
                .setColor(config.colors.error)
                .setTitle('❌ Item Not Found')
                .setDescription(`Player does not have **${itemLabel}** in their inventory.`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Remove item using RSGCore function
        const success = player.Functions.RemoveItem(itemName, amount);

        if (success) {
            // Trigger inventory update
            TriggerClientEvent('inventory:client:ItemBox', playerId, RSGCore.Shared.Items[itemName], 'remove', amount);

            const itemLabel = RSGCore.Shared.Items[itemName]?.label || itemName;

            const embed = new MessageEmbed()
                .setColor(config.colors.success)
                .setTitle('🗑️ Item Removed Successfully')
                .setDescription(`Removed **${amount}x ${itemLabel}** from **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
                .addFields(
                    {
                        name: '📋 Player Info',
                        value: [
                            `**Name:** ${playerData.charinfo.firstname} ${playerData.charinfo.lastname}`,
                            `**Citizen ID:** ${playerData.citizenid}`,
                            `**Server ID:** ${playerId}`,
                        ].join('\n'),
                        inline: false,
                    },
                    {
                        name: '📦 Item Details',
                        value: [
                            `**Item:** ${itemLabel}`,
                            `**Item Name:** ${itemName}`,
                            `**Amount Removed:** ${amount}`,
                            `**Remaining:** ${hasItem.amount - amount}`,
                        ].join('\n'),
                        inline: false,
                    }
                )
                .setFooter({ text: `rsg-discord | Executed by ${message.author.tag}` })
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Log to server console
            console.log(`[rsg-discord] ${message.author.tag} removed ${amount}x ${itemName} from player ${playerData.citizenid} (ID: ${playerId})`);

        } else {
            const embed = new MessageEmbed()
                .setColor(config.colors.error)
                .setTitle('❌ Failed to Remove Item')
                .setDescription(`Could not remove item **${itemName}**. Player may not have enough items.`)
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('[rsg-discord] Error removing item:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription('Failed to remove item. Check server console for details.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
