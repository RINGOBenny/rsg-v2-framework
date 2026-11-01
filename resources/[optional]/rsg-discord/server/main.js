const { Client, Intents, MessageEmbed } = require('discord.js');
const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');
const commands = require(GetResourcePath(GetCurrentResourceName()) + '/server/commands');
const utils = require(GetResourcePath(GetCurrentResourceName()) + '/server/utils');

let discordClient = null;
let isReady = false;

// Register slash commands
async function registerSlashCommands() {
    try {
        console.log('[rsg-discord] Registering slash commands...');
        
        const guild = await discordClient.guilds.fetch(config.guildId);
        
        // Clear existing commands
        await guild.commands.set([]);
        console.log('[rsg-discord] Cleared existing slash commands');
        
        // Build slash commands from config
        const slashCommands = [];
        
        for (const [commandName, commandConfig] of Object.entries(config.commands)) {
            if (!commandConfig.enabled) continue;
            
            const slashCommand = {
                name: commandName,
                description: commandConfig.description || 'No description provided',
            };
            
            // Add options based on command
            if (commandName === 'player') {
                slashCommand.options = [
                    {
                        name: 'player_id',
                        description: 'Player server ID',
                        type: 3, // STRING
                        required: true,
                    },
                ];
            } else if (commandName === 'inventory') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                ];
            } else if (commandName === 'horses') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                ];
            } else if (commandName === 'horse') {
                slashCommand.options = [
                    {
                        name: 'horse_id',
                        description: 'Horse ID',
                        type: 3,
                        required: true,
                    },
                ];
            } else if (commandName === 'telegram') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'count',
                        description: 'Number of telegrams to show',
                        type: 4, // INTEGER
                        required: false,
                    },
                    {
                        name: 'type',
                        description: 'Type of telegrams',
                        type: 3,
                        required: false,
                        choices: [
                            { name: 'All', value: 'all' },
                            { name: 'Sent', value: 'sent' },
                            { name: 'Received', value: 'received' },
                        ],
                    },
                ];
            } else if (commandName === 'setmoney') {
                // Get money types from RSG Core config
                const RSGCore = global.exports['rsg-core'].GetCoreObject();
                const moneyTypes = RSGCore.Config.Money.MoneyTypes || { cash: 0, bank: 0 };
                
                // Build choices from money types
                const moneyChoices = Object.keys(moneyTypes).map(type => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
                    value: type
                }));
                
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'type',
                        description: 'Money type',
                        type: 3,
                        required: true,
                        choices: moneyChoices,
                    },
                    {
                        name: 'amount',
                        description: 'Amount to set',
                        type: 10, // NUMBER
                        required: true,
                    },
                ];
            } else if (commandName === 'revive') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                ];
            } else if (commandName === 'addmoney' || commandName === 'removemoney') {
                // Get money types from RSG Core config
                const RSGCore = global.exports['rsg-core'].GetCoreObject();
                const moneyTypes = RSGCore.Config.Money.MoneyTypes || { cash: 0, bank: 0 };
                
                // Build choices from money types
                const moneyChoices = Object.keys(moneyTypes).map(type => ({
                    name: type.charAt(0).toUpperCase() + type.slice(1),
                    value: type
                }));
                
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'type',
                        description: 'Money type',
                        type: 3,
                        required: true,
                        choices: moneyChoices,
                    },
                    {
                        name: 'amount',
                        description: 'Amount',
                        type: 10, // NUMBER
                        required: true,
                    },
                ];
            } else if (commandName === 'giveitem') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'item',
                        description: 'Item name',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'amount',
                        description: 'Amount',
                        type: 4,
                        required: true,
                    },
                ];
            } else if (commandName === 'removeitem') {
                slashCommand.options = [
                    {
                        name: 'identifier',
                        description: 'Player ID or CitizenID',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'item',
                        description: 'Item name',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'amount',
                        description: 'Amount',
                        type: 4,
                        required: true,
                    },
                ];
            } else if (commandName === 'weather') {
                slashCommand.options = [
                    {
                        name: 'type',
                        description: 'Weather type',
                        type: 3,
                        required: true,
                        choices: [
                            { name: 'Sunny', value: 'sunny' },
                            { name: 'Clear', value: 'clear' },
                            { name: 'Clouds', value: 'clouds' },
                            { name: 'Overcast', value: 'overcast' },
                            { name: 'Rain', value: 'rain' },
                            { name: 'Thunder', value: 'thunder' },
                            { name: 'Snow', value: 'snow' },
                            { name: 'Blizzard', value: 'blizzard' },
                            { name: 'Fog', value: 'fog' },
                        ],
                    },
                ];
            } else if (commandName === 'giveitemall') {
                slashCommand.options = [
                    {
                        name: 'type',
                        description: 'Target players',
                        type: 3,
                        required: true,
                        choices: [
                            { name: 'Online Players', value: 'online' },
                            { name: 'All Players (Including Offline)', value: 'all' },
                        ],
                    },
                    {
                        name: 'item',
                        description: 'Item name',
                        type: 3,
                        required: true,
                    },
                    {
                        name: 'amount',
                        description: 'Amount',
                        type: 4,
                        required: true,
                    },
                ];
            }
            
            slashCommands.push(slashCommand);
        }
        
        // Register commands
        await guild.commands.set(slashCommands);
        console.log(`[rsg-discord] Registered ${slashCommands.length} slash commands`);
        
    } catch (error) {
        console.error('[rsg-discord] Error registering slash commands:', error);
    }
}

// Initialize Discord Client
function initializeDiscord() {
    if (discordClient) {
        console.log('[rsg-discord] Discord client already initialized');
        return;
    }

    discordClient = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
        ],
    });

    discordClient.once('ready', async () => {
        console.log(`[rsg-discord] Discord bot logged in as ${discordClient.user.tag}`);
        
        // Set bot status
        discordClient.user.setActivity('RedM Server', { type: 'WATCHING' });
        
        // Register slash commands
        await registerSlashCommands();
        
        isReady = true;
        emit('rsg-discord:ready');
    });

    // Handle slash command interactions
    discordClient.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        // Check if interaction is from correct guild
        if (interaction.guildId !== config.guildId) return;

        // Check if user has moderator role
        if (config.moderatorRoles.length > 0) {
            const hasRole = interaction.member.roles.cache.some(role => 
                config.moderatorRoles.includes(role.id)
            );
            if (!hasRole) {
                return interaction.reply({ 
                    content: '❌ You do not have permission to use this command.', 
                    ephemeral: true 
                });
            }
        }

        const commandName = interaction.commandName;

        if (config.debug) {
            console.log('[rsg-discord DEBUG] Slash command:', commandName);
            console.log('[rsg-discord DEBUG] User:', interaction.user.tag);
            console.log('[rsg-discord DEBUG] Options:', interaction.options.data);
        }

        // Map slash command to command handler
        if (commands[commandName]) {
            try {
                console.log(`[rsg-discord] Executing slash command: ${commandName} by ${interaction.user.tag}`);
                
                // Defer reply to prevent timeout on long operations
                await interaction.deferReply();
                
                // Build args array from interaction options
                const args = [];
                
                if (commandName === 'player') {
                    args.push(interaction.options.getString('player_id'));
                } else if (['inventory', 'horses', 'revive'].includes(commandName)) {
                    args.push(interaction.options.getString('identifier'));
                } else if (commandName === 'horse') {
                    args.push(interaction.options.getString('horse_id'));
                } else if (commandName === 'telegram') {
                    args.push(interaction.options.getString('identifier'));
                    const count = interaction.options.getInteger('count');
                    const type = interaction.options.getString('type');
                    if (count) args.push(count.toString());
                    if (type) args.push(type);
                } else if (commandName === 'setmoney') {
                    args.push(interaction.options.getString('identifier'));
                    args.push(interaction.options.getString('type'));
                    args.push(interaction.options.getNumber('amount').toString());
                } else if (['addmoney', 'removemoney'].includes(commandName)) {
                    args.push(interaction.options.getString('identifier'));
                    args.push(interaction.options.getString('type'));
                    args.push(interaction.options.getNumber('amount').toString());
                } else if (['giveitem', 'removeitem'].includes(commandName)) {
                    args.push(interaction.options.getString('identifier'));
                    args.push(interaction.options.getString('item'));
                    args.push(interaction.options.getInteger('amount').toString());
                } else if (commandName === 'weather') {
                    args.push(interaction.options.getString('type'));
                } else if (commandName === 'giveitemall') {
                    args.push(interaction.options.getString('type'));
                    args.push(interaction.options.getString('item'));
                    args.push(interaction.options.getInteger('amount').toString());
                }
                
                // Create a message-like object for compatibility with existing command handlers
                const messageProxy = {
                    reply: async (options) => {
                        if (typeof options === 'string') {
                            await interaction.editReply({ content: options });
                        } else {
                            await interaction.editReply(options);
                        }
                    },
                    author: interaction.user,
                    guild: interaction.guild,
                    channel: interaction.channel,
                };
                
                // Execute command
                await commands[commandName](messageProxy, args);
                
            } catch (error) {
                console.error(`[rsg-discord] Error executing slash command ${commandName}:`, error);
                
                const embed = new MessageEmbed()
                    .setColor(config.colors.error)
                    .setTitle('❌ Command Error')
                    .setDescription(`An error occurred while executing the command.`)
                    .setTimestamp();
                
                try {
                    if (interaction.deferred) {
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                } catch (replyError) {
                    console.error('[rsg-discord] Error sending error message:', replyError);
                }
            }
        } else {
            await interaction.reply({ 
                content: `❌ Unknown command: ${commandName}`, 
                ephemeral: true 
            });
        }
    });

    discordClient.on('error', (error) => {
        console.error('[rsg-discord] Discord client error:', error);
    });

    // Login to Discord
    discordClient.login(config.botToken).catch((error) => {
        console.error('[rsg-discord] Failed to login to Discord:', error);
    });
}

// Export functions
global.exports('getDiscordClient', () => discordClient);
global.exports('isDiscordReady', () => isReady);

global.exports('sendEmbed', (channelId, embed) => {
    if (!isReady || !discordClient) {
        console.error('[rsg-discord] Discord client not ready');
        return false;
    }

    const channel = discordClient.channels.cache.get(channelId);
    if (!channel) {
        console.error(`[rsg-discord] Channel ${channelId} not found`);
        return false;
    }

    channel.send({ embeds: [embed] });
    return true;
});

// Initialize on resource start
setImmediate(() => {
    console.log('[rsg-discord] Initializing Discord bot...');
    initializeDiscord();
});

// Cleanup on resource stop
on('onResourceStop', (resourceName) => {
    if (resourceName === GetCurrentResourceName()) {
        if (discordClient) {
            console.log('[rsg-discord] Shutting down Discord bot...');
            discordClient.destroy();
        }
    }
});
