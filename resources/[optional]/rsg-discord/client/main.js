// Client-side script for rsg-discord
// Handles client-to-server communication if needed

console.log('[rsg-discord] Client initialized');

// Example: Send player join notification to Discord (if needed)
RegisterNetEvent('RSGCore:Client:OnPlayerLoaded', () => {
    // Notify server that player loaded
    // Can be used for Discord notifications
});

// Example: Export for other resources
exports('isDiscordConnected', () => {
    // Check if Discord bot is connected via server
    return true; // This would be checked server-side
});
