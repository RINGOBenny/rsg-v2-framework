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
            .setDescription(`**Usage:** ${config.commands.giveitem.usage}\n\n**Examples:**\n/giveitem 1 water 5\n/giveitem ABC123 lockpick 10\n/giveitem 1 weapon_revolver_cattleman 1`)
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
        // Add item using RSGCore function
        const success = player.Functions.AddItem(itemName, amount);

        if (success) {
            // Trigger inventory update
            TriggerClientEvent('inventory:client:ItemBox', playerId, RSGCore.Shared.Items[itemName], 'add', amount);

            const itemLabel = RSGCore.Shared.Items[itemName]?.label || itemName;

            const embed = new MessageEmbed()
                .setColor(config.colors.success)
                .setTitle('🎁 Item Given Successfully')
                .setDescription(`Gave **${amount}x ${itemLabel}** to **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
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
                            `**Amount:** ${amount}`,
                        ].join('\n'),
                        inline: false,
                    }
                )
                .setFooter({ text: `rsg-discord | Executed by ${message.author.tag}` })
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Log to server console
            console.log(`[rsg-discord] ${message.author.tag} gave ${amount}x ${itemName} to player ${playerData.citizenid} (ID: ${playerId})`);

        } else {
            const embed = new MessageEmbed()
                .setColor(config.colors.error)
                .setTitle('❌ Failed to Give Item')
                .setDescription(`Could not give item **${itemName}**. Item may not exist or player inventory is full.`)
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('[rsg-discord] Error giving item:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription('Failed to give item. Check server console for details.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
