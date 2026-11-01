const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.revive.usage}\n\n**Examples:**\n/revive 1\n/revive ABC123`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];

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
        // Trigger admin revive event
        TriggerClientEvent('rsg-medic:client:adminRevive', playerId);

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle('✨ Player Revived')
            .setDescription(`Successfully revived **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
            .addFields(
                {
                    name: '📋 Player Info',
                    value: [
                        `**Name:** ${playerData.charinfo.firstname} ${playerData.charinfo.lastname}`,
                        `**Citizen ID:** ${playerData.citizenid}`,
                        `**Server ID:** ${playerId}`,
                    ].join('\n'),
                    inline: false,
                }
            )
            .setFooter({ text: `rsg-discord | Executed by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        // Log to server console
        console.log(`[rsg-discord] ${message.author.tag} revived player ${playerData.citizenid} (ID: ${playerId})`);

    } catch (error) {
        console.error('[rsg-discord] Error reviving player:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription('Failed to revive player. Check server console for details.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
