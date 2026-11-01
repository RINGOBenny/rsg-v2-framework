const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.player.usage}\n\n**Example:** /player 1`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const playerId = args[0];
    const player = utils.getPlayerById(playerId);

    if (!player) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Player Not Found')
            .setDescription(`No player found with ID: **${playerId}**`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const playerData = player.PlayerData;
    
    // Build player info embed
    const embed = new MessageEmbed()
        .setColor(config.colors.success)
        .setTitle(`👤 Player Information - ID: ${playerId}`)
        .setDescription(`Detailed information for **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
        .addFields(
            {
                name: '📋 Basic Info',
                value: [
                    `**Name:** ${playerData.charinfo.firstname} ${playerData.charinfo.lastname}`,
                    `**Citizen ID:** ${playerData.citizenid}`,
                    `**License:** ${playerData.license}`,
                ].join('\n'),
                inline: false,
            },
            {
                name: '💼 Job Information',
                value: [
                    `**Job:** ${playerData.job.label}`,
                    `**Grade:** ${playerData.job.grade.name} (Level ${playerData.job.grade.level})`,
                    `**On Duty:** ${playerData.job.onduty ? '✅ Yes' : '❌ No'}`,
                ].join('\n'),
                inline: true,
            },
            {
                name: '💰 Money',
                value: [
                    `**Cash:** ${utils.formatMoney(playerData.money.cash || 0)}`,
                    `**Bank:** ${utils.formatMoney(playerData.money.bank || 0)}`,
                    `**Total:** ${utils.formatMoney((playerData.money.cash || 0) + (playerData.money.bank || 0))}`,
                ].join('\n'),
                inline: true,
            }
        )
        .setFooter({ text: `rsg-discord | Requested by ${message.author.tag}` })
        .setTimestamp();

    // Add gang info if exists
    if (playerData.gang) {
        embed.addFields({
            name: '👥 Gang Information',
            value: [
                `**Gang:** ${playerData.gang.label || 'None'}`,
                `**Grade:** ${playerData.gang.grade?.name || 'N/A'}`,
            ].join('\n'),
            inline: false,
        });
    }

    // Add character info
    if (playerData.charinfo) {
        const charinfo = playerData.charinfo;
        embed.addFields({
            name: '🎭 Character Details',
            value: [
                `**Gender:** ${charinfo.gender === 0 ? 'Male' : 'Female'}`,
                `**Birthdate:** ${charinfo.birthdate || 'Unknown'}`,
                `**Nationality:** ${charinfo.nationality || 'Unknown'}`,
            ].join('\n'),
            inline: false,
        });
    }

    message.reply({ embeds: [embed] });
};
