const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 3) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.setmoney.usage}\n\n**Examples:**\n/setmoney 1 cash 500\n/setmoney 1 bank 1000\n/setmoney ABC123 cash 250`)
            .addFields({
                name: '💰 Money Types',
                value: '`cash` - Player\'s cash\n`bank` - Player\'s bank account',
                inline: false,
            })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
    const moneyType = args[1].toLowerCase();
    const amount = parseFloat(args[2]);

    // Validate money type
    if (!['cash', 'bank'].includes(moneyType)) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Money Type')
            .setDescription('Money type must be either `cash` or `bank`.')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Validate amount
    if (isNaN(amount) || amount < 0) {
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
    const oldAmount = playerData.money[moneyType] || 0;

    try {
        // Set money using RSGCore function
        player.Functions.SetMoney(moneyType, amount, 'Discord Admin Command');

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle('💰 Money Updated Successfully')
            .setDescription(`Updated **${moneyType}** for **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
            .addFields(
                {
                    name: '📋 Player Info',
                    value: [
                        `**Name:** ${playerData.charinfo.firstname} ${playerData.charinfo.lastname}`,
                        `**Citizen ID:** ${playerData.citizenid}`,
                        `**Server ID:** ${player.PlayerData.source}`,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '💵 Transaction Details',
                    value: [
                        `**Money Type:** ${moneyType}`,
                        `**Old Amount:** ${utils.formatMoney(oldAmount)}`,
                        `**New Amount:** ${utils.formatMoney(amount)}`,
                        `**Difference:** ${utils.formatMoney(amount - oldAmount)}`,
                    ].join('\n'),
                    inline: false,
                }
            )
            .setFooter({ text: `rsg-discord | Executed by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        // Log to server console
        console.log(`[rsg-discord] ${message.author.tag} set ${moneyType} to ${amount} for player ${playerData.citizenid} (was ${oldAmount})`);

    } catch (error) {
        console.error('[rsg-discord] Error setting money:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription('Failed to set money. Check server console for details.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
