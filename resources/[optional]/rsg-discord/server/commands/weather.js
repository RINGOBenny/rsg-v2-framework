const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.weather.usage}\n\n**Available Weather Types:**\n\`\`\`\nsunny, clear, clouds, overcast, rain, thunder, snow, blizzard, fog, smog, clearing, neutral, highpressure\n\`\`\`\n**Examples:**\n/weather sunny\n/weather rain\n/weather snow`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const weatherType = args[0].toLowerCase();

    // Valid weather types for RedM
    const validWeatherTypes = [
        'sunny', 'clear', 'clouds', 'overcast', 'rain', 'thunder', 
        'snow', 'blizzard', 'fog', 'smog', 'clearing', 'neutral', 'highpressure'
    ];

    if (!validWeatherTypes.includes(weatherType)) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Weather Type')
            .setDescription(`**${weatherType}** is not a valid weather type.\n\n**Available types:**\n\`\`\`\n${validWeatherTypes.join(', ')}\n\`\`\``)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    try {
        // Trigger weather sync event
        global.exports['weathersync'].setWeather(weatherType);

        // Get weather icon emoji
        const weatherIcons = {
            'sunny': '☀️',
            'clear': '🌤️',
            'clouds': '☁️',
            'overcast': '🌥️',
            'rain': '🌧️',
            'thunder': '⛈️',
            'snow': '❄️',
            'blizzard': '🌨️',
            'fog': '🌫️',
            'smog': '🌫️',
            'clearing': '⛅',
            'neutral': '🌤️',
            'highpressure': '☀️'
        };

        const icon = weatherIcons[weatherType] || '🌍';

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle(`${icon} Weather Changed`)
            .setDescription(`Server weather has been set to **${weatherType}**`)
            .addFields({
                name: '🌦️ Weather Info',
                value: [
                    `**New Weather:** ${weatherType}`,
                    `**Changed By:** ${message.author.tag}`,
                    `**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:R>`,
                ].join('\n'),
                inline: false,
            })
            .setFooter({ text: `rsg-discord | Executed by ${message.author.tag}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        // Log to server console
        console.log(`[rsg-discord] ${message.author.tag} changed weather to ${weatherType}`);

    } catch (error) {
        console.error('[rsg-discord] Error changing weather:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Error')
            .setDescription('Failed to change weather. Make sure `weathersync` resource is running.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
