const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.telegram.usage}\n\n**Examples:**\n/telegram 1 10 sent\n/telegram ABC123 5 received\n/telegram 1`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
    const count = args[1] ? parseInt(args[1]) : config.commands.telegram.defaultCount;
    const type = args[2] ? args[2].toLowerCase() : 'all';

    // Validate count
    if (isNaN(count) || count < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Count')
            .setDescription('Count must be a positive number.')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Limit count
    const limitedCount = Math.min(count, config.commands.telegram.maxCount);

    // Validate type
    if (!['all', 'sent', 'send', 'received', 'receive'].includes(type)) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Type')
            .setDescription('Type must be either **sent**, **received**, or **all**.')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

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
        let query = 'SELECT * FROM telegrams WHERE ';
        let params = [];

        // Build query based on type
        if (type === 'sent' || type === 'send') {
            query += 'sender = ?';
            params = [citizenId];
        } else if (type === 'received' || type === 'receive') {
            query += 'recipient = ?';
            params = [citizenId];
        } else {
            query += '(sender = ? OR recipient = ?)';
            params = [citizenId, citizenId];
        }

        query += ' ORDER BY sentDate DESC LIMIT ?';
        params.push(limitedCount);

        // Query telegrams from database
        const telegrams = await utils.fetchAll(query, params);

        if (!telegrams || telegrams.length === 0) {
            const embed = new MessageEmbed()
                .setColor(config.colors.info)
                .setTitle('📬 Telegrams - None Found')
                .setDescription(`No telegrams found for CitizenID: **${citizenId}**\nType: **${type}**`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Build telegrams list
        const telegramsList = telegrams.map((telegram, index) => {
            const date = utils.formatDate(telegram.sentDate);
            const isSent = telegram.sender === citizenId;
            const direction = isSent ? '📤 Sent to' : '📥 Received from';
            const otherParty = isSent ? telegram.recipient : telegram.sender;
            const message = telegram.message || 'No message';
            const messagePreview = message.length > 100 ? message.substring(0, 100) + '...' : message;
            
            return [
                `**${index + 1}. ${direction}** ${otherParty}`,
                `   📅 ${date}`,
                `   💬 "${messagePreview}"`,
            ].join('\n');
        }).join('\n\n');

        // Calculate stats
        const sentCount = telegrams.filter(t => t.sender === citizenId).length;
        const receivedCount = telegrams.filter(t => t.recipient === citizenId).length;

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle('📬 Telegram History')
            .setDescription(`Telegram history for CitizenID: **${citizenId}**`)
            .addFields(
                {
                    name: '📊 Summary',
                    value: [
                        `**Type:** ${type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}`,
                        `**Sent:** ${sentCount}`,
                        `**Received:** ${receivedCount}`,
                        `**Showing:** ${telegrams.length} of ${limitedCount} requested`,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '📨 Recent Telegrams',
                    value: utils.truncate(telegramsList, 1000),
                    inline: false,
                }
            )
            .setFooter({ text: `rsg-discord | Requested by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('[rsg-discord] Error fetching telegrams:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Database Error')
            .setDescription('Failed to fetch telegrams from database.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
