const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.horses.usage}\n\n**Example:** /horses 1\n**Example:** /horses ABC123`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
    let citizenId;

    // Get CitizenID
    const player = utils.getPlayer(identifier);
    if (player) {
        citizenId = player.PlayerData.citizenid;
    } else {
        // Assume identifier is CitizenID
        citizenId = identifier;
    }

    try {
        // Query horses from database
        const horses = await utils.fetchAll(
            'SELECT * FROM player_horses WHERE citizenid = ? ORDER BY id DESC',
            [citizenId]
        );

        if (!horses || horses.length === 0) {
            const embed = new MessageEmbed()
                .setColor(config.colors.info)
                .setTitle('🐴 Player Horses - None Found')
                .setDescription(`No horses found for CitizenID: **${citizenId}**`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Build horses list
        const horsesList = horses.map((horse, index) => {
            const name = horse.name || 'Unnamed Horse';
            
            // Debug: log the actual horse value
            if (config.debug) {
                console.log(`[rsg-discord DEBUG] Horse ID ${horse.id}: horse="${horse.horse}"`);
            }
            
            const model = utils.getHorseName(horse.horse);
            const active = horse.active === 1 ? '✅ Active' : '❌ Inactive';
            
            return [
                `**${index + 1}. ${name}** (ID: ${horse.id})`,
                `   Model: ${model}`,
                `   Status: ${active}`,
            ].join('\n');
        }).join('\n\n');

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle('🐴 Player Horses')
            .setDescription(`Horses owned by CitizenID: **${citizenId}**`)
            .addFields(
                {
                    name: '📊 Summary',
                    value: `**Total Horses:** ${horses.length}`,
                    inline: false,
                },
                {
                    name: '🐎 Horse List',
                    value: utils.truncate(horsesList, 1000),
                    inline: false,
                }
            )
            .setFooter({ text: `rsg-discord | Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('[rsg-discord] Error fetching horses:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Database Error')
            .setDescription('Failed to fetch horses from database.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
