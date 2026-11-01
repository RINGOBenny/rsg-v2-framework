module.exports = {
    // Discord Bot Configuration
    botToken: 'YOUR_DISCORD_BOT_TOKEN_HERE',
    guildId: 'YOUR_GUILD_ID_HERE',
    
    
    // Channel IDs for commands (optional - leave empty to allow in all channels)
    allowedChannels: [
        // 'CHANNEL_ID_1',
        // 'CHANNEL_ID_2',
    ],
    
    // Role IDs that can use commands
    moderatorRoles: [
        // 'ROLE_ID_1',
        // 'ROLE_ID_2',
    ],
    
    // Command Settings
    commands: {
        player: {
            enabled: true,
            description: 'Show player data including job, money, and status',
            usage: '/player [player ID]',
        },
        inventory: {
            enabled: true,
            description: 'Get player inventory by ID or CitizenID',
            usage: '/inventory [player ID / CitizenID]',
        },
        horses: {
            enabled: true,
            description: 'Get all horses owned by player',
            usage: '/horses [player ID / CitizenID]',
        },
        horse: {
            enabled: true,
            description: 'Get specific horse information and inventory',
            usage: '/horse [horse ID]',
        },
        telegram: {
            enabled: true,
            description: 'Get player telegram history',
            usage: '/telegram [player ID / CitizenID] [count] [type: sent/received]',
            defaultCount: 10,
            maxCount: 50,
        },
    },
    
    // Embed Colors
    colors: {
        success: 0x90EE90,
        error: 0xFF6B6B,
        warning: 0xFFA000,
        info: 0x87CEEB,
        primary: 0xFFCA28,
    },
    
    // Debug Mode
    debug: false,
};
