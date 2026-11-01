const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

module.exports = async (message, args) => {
    if (args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('⚠️ Invalid Usage')
            .setDescription(`**Usage:** ${config.commands.inventory.usage}\n\n**Example:** /inventory 1\n**Example:** /inventory ABC123`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
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
    const inventory = playerData.items || {};

    // Count items
    const itemCount = Object.keys(inventory).length;

    if (itemCount === 0) {
        const embed = new MessageEmbed()
            .setColor(config.colors.info)
            .setTitle('📦 Player Inventory - Empty')
            .setDescription(`**${playerData.charinfo.firstname} ${playerData.charinfo.lastname}** has no items in inventory.`)
            .addFields({
                name: '📋 Player Info',
                value: [
                    `**Citizen ID:** ${playerData.citizenid}`,
                    `**Server ID:** ${player.PlayerData.source}`,
                ].join('\n'),
            })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Build inventory list
    const inventoryList = [];
    for (const [slot, item] of Object.entries(inventory)) {
        if (item && item.name) {
            const itemInfo = `**[Slot ${slot}]** ${item.label || item.name}`;
            const amount = item.amount > 1 ? ` x${item.amount}` : '';
            const info = item.info ? ` *(${JSON.stringify(item.info).substring(0, 30)}...)*` : '';
            inventoryList.push(`${itemInfo}${amount}${info}`);
        }
    }

    // Split into chunks if too long
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (const item of inventoryList) {
        if (currentLength + item.length > 900) {
            chunks.push(currentChunk.join('\n'));
            currentChunk = [item];
            currentLength = item.length;
        } else {
            currentChunk.push(item);
            currentLength += item.length;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
    }

    // Send first embed with inventory
    const embed = new MessageEmbed()
        .setColor(config.colors.success)
        .setTitle('📦 Player Inventory')
        .setDescription(`Inventory for **${playerData.charinfo.firstname} ${playerData.charinfo.lastname}**`)
        .addFields(
            {
                name: '📋 Player Info',
                value: [
                    `**Citizen ID:** ${playerData.citizenid}`,
                    `**Server ID:** ${player.PlayerData.source}`,
                    `**Total Items:** ${itemCount}`,
                ].join('\n'),
            },
            {
                name: '🎒 Items',
                value: chunks[0] || 'No items',
            }
        )
        .setFooter({ text: `rsg-discord | Requested by ${message.author.tag}` })
        .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Send additional embeds if needed
    for (let i = 1; i < chunks.length; i++) {
        const continueEmbed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle(`📦 Player Inventory (continued ${i + 1}/${chunks.length})`)
            .addFields({
                name: '🎒 Items',
                value: chunks[i],
            })
            .setTimestamp();
        
        await message.channel.send({ embeds: [continueEmbed] });
    }
};
