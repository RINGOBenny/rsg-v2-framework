const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.horse.usage}\n\n**Example:** /horse 123`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const horseId = args[0];

    try {
        // Query horse from database
        const horse = await utils.fetchSingle(
            'SELECT * FROM player_horses WHERE id = ?',
            [horseId]
        );

        if (!horse) {
            const embed = new MessageEmbed()
                .setColor(config.colors.error)
                .setTitle('❌ Horse Not Found')
                .setDescription(`No horse found with ID: **${horseId}**`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Parse horse data
        const name = horse.name || 'Unnamed Horse';
        const model = utils.getHorseName(horse.horse);
        const active = horse.active === 1 ? '✅ Active' : '❌ Inactive';
        
        // Parse components if exists
        let components = 'None';
        if (horse.components) {
            try {
                const compsData = JSON.parse(horse.components);
                components = Object.keys(compsData).length > 0 
                    ? JSON.stringify(compsData, null, 2).substring(0, 200) + '...'
                    : 'None';
            } catch (e) {
                components = 'Invalid data';
            }
        }

        // Build horse info embed
        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle(`🐴 Horse Information - ID: ${horseId}`)
            .setDescription(`Detailed information for **${name}**`)
            .addFields(
                {
                    name: '📋 Basic Info',
                    value: [
                        `**Horse ID:** ${horse.id}`,
                        `**Name:** ${name}`,
                        `**Model:** ${model}`,
                        `**Owner CitizenID:** ${horse.citizenid}`,
                        `**Status:** ${active}`,
                        `**Gender:** ${horse.gender || 'Unknown'}`,
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '🎨 Components',
                    value: `\`\`\`json\n${components}\n\`\`\``,
                    inline: false,
                }
            )
            .setFooter({ text: `rsg-discord | Requested by ${message.author.tag}` })
            .setTimestamp();

        // Query horse inventory from inventories table
        // Identifier format: "HorseName HorseID" (e.g., "Test 2 AZP260")
        const inventoryIdentifier = `${name} ${horse.horseid}`;
        
        try {
            const inventoryData = await utils.fetchSingle(
                'SELECT items FROM inventories WHERE identifier = ?',
                [inventoryIdentifier]
            );

            if (inventoryData && inventoryData.items) {
                const inventory = JSON.parse(inventoryData.items);
                const itemCount = Object.keys(inventory).length;
                
                if (itemCount > 0) {
                    const inventoryList = Object.entries(inventory)
                        .filter(([slot, item]) => item && item.name)
                        .map(([slot, item]) => {
                            const amount = item.amount > 1 ? ` x${item.amount}` : '';
                            return `**[${slot}]** ${item.label || item.name}${amount}`;
                        })
                        .join('\n');

                    embed.addFields({
                        name: `🎒 Horse Inventory (${itemCount} items)`,
                        value: utils.truncate(inventoryList || 'Empty', 1000),
                        inline: false,
                    });
                } else {
                    embed.addFields({
                        name: '🎒 Horse Inventory',
                        value: 'Empty',
                        inline: false,
                    });
                }
            } else {
                embed.addFields({
                    name: '🎒 Horse Inventory',
                    value: 'No inventory found',
                    inline: false,
                });
            }
        } catch (e) {
            console.error('[rsg-discord] Error fetching horse inventory:', e);
            embed.addFields({
                name: '🎒 Horse Inventory',
                value: 'Error loading inventory',
                inline: false,
            });
        }

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('[rsg-discord] Error fetching horse:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Database Error')
            .setDescription('Failed to fetch horse from database.')
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
