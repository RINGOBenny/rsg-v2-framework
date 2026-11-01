const { MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

const RSGCore = global.exports['rsg-core'].GetCoreObject();

module.exports = async (message, args) => {
    // Usage: /addmoney <identifier> <type> <amount>
    if (args.length < 3) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Usage')
            .setDescription('**Usage:** `/addmoney <identifier> <type> <amount>`')
            .addField('Example', '`/addmoney 1 cash 500`')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const identifier = args[0];
    const moneyType = args[1].toLowerCase();
    const amount = parseFloat(args[2]);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Amount')
            .setDescription('Amount must be a positive number')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Get player
    const player = utils.getPlayer(identifier);
    if (!player) {
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Player Not Found')
            .setDescription(`Could not find player with identifier: **${identifier}**\n\n**Tip:** Use server ID (1-32) or CitizenID (ABC12345)`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Validate money type
    const moneyTypes = RSGCore.Config.Money.MoneyTypes || {};
    if (!moneyTypes.hasOwnProperty(moneyType)) {
        const validTypes = Object.keys(moneyTypes).join(', ');
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Invalid Money Type')
            .setDescription(`Invalid money type: **${moneyType}**\n\n**Valid types:** ${validTypes}`)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    try {
        const oldBalance = player.PlayerData.money[moneyType] || 0;
        
        // Add money
        player.Functions.AddMoney(moneyType, amount, 'discord-admin-add');
        
        const newBalance = player.PlayerData.money[moneyType] || 0;

        const embed = new MessageEmbed()
            .setColor(config.colors.success)
            .setTitle('💰 Money Added')
            .setDescription(`Successfully added money to **${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}**`)
            .addField('Player', `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}\nCitizenID: ${player.PlayerData.citizenid}\nServer ID: ${player.PlayerData.source}`, true)
            .addField('Money Type', moneyType.charAt(0).toUpperCase() + moneyType.slice(1), true)
            .addField('Amount Added', `$${amount.toFixed(2)}`, true)
            .addField('Old Balance', `$${oldBalance.toFixed(2)}`, true)
            .addField('New Balance', `$${newBalance.toFixed(2)}`, true)
            .setFooter({ text: `Executed by ${message.author.tag}` })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('[rsg-discord] Error adding money:', error);
        
        const embed = new MessageEmbed()
            .setColor(config.colors.error)
            .setTitle('❌ Command Error')
            .setDescription(`Failed to add money: ${error.message}`)
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
