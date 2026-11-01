const config = require(GetResourcePath(GetCurrentResourceName()) + '/config.js');

// Get RSGCore object
const RSGCore = global.exports['rsg-core'].GetCoreObject();

const utils = {
    /**
     * Debug log function
     */
    debug: (...args) => {
        if (config.debug) {
            console.log('[rsg-discord DEBUG]', ...args);
        }
    },

    /**
     * Get player from server by ID
     */
    getPlayerById: (playerId) => {
        const numId = parseInt(playerId);
        if (isNaN(numId)) return null;

        const player = RSGCore.Functions.GetPlayer(numId);
        return player;
    },

    /**
     * Get player by CitizenID
     */
    getPlayerByCitizenId: (citizenId) => {
        const player = RSGCore.Functions.GetPlayerByCitizenId(citizenId);
        return player;
    },

    /**
     * Get player by ID or CitizenID
     */
    getPlayer: (identifier) => {
        // Try as player ID first
        const numId = parseInt(identifier);
        if (!isNaN(numId)) {
            const player = utils.getPlayerById(numId);
            if (player) return player;
        }

        // Try as CitizenID
        return utils.getPlayerByCitizenId(identifier);
    },

    /**
     * Format money amount
     */
    formatMoney: (amount) => {
        return `$${parseFloat(amount).toFixed(2)}`;
    },

    /**
     * Format date
     */
    formatDate: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    /**
     * Truncate string
     */
    truncate: (str, maxLength = 1024) => {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },

    /**
     * Execute MySQL query
     */
    executeQuery: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            global.exports.oxmysql.execute(query, params, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Query failed'));
                }
            });
        });
    },

    /**
     * Fetch single MySQL result
     */
    fetchSingle: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            global.exports.oxmysql.single(query, params, (result) => {
                resolve(result || null);
            });
        });
    },

    /**
     * Fetch all MySQL results
     */
    fetchAll: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            global.exports.oxmysql.query(query, params, (result) => {
                resolve(result || []);
            });
        });
    },

    /**
     * Execute MySQL query (for INSERT, UPDATE, DELETE)
     */
    execute: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            global.exports.oxmysql.execute(query, params, (result) => {
                resolve(result || 0);
            });
        });
    },

    /**
     * Get horse name from model hash
     * Maps horse model to friendly name from rsg-horses/horse_settings
     */
    getHorseName: (model) => {
        if (!model) return 'Unknown';
        
        const horseNames = {
            // Valentine
            'a_c_horse_dutchwarmblood_chocolateroan': 'Chocolate Dutch Warmblood',
            'a_c_horse_dutchwarmblood_sootybuckskin': 'Sooty Dutch Warmblood',
            'a_c_horse_kentuckysaddle_silverbay': 'Silver Bay Kentucky Saddler',
            'a_c_horse_kentuckysaddle_buttermilkbuckskin_pc': 'Buttermilk Buckskin Kentucky Saddler',
            'a_c_horse_morgan_bay': 'Morgan Bay',
            'a_c_horse_morgan_bayroan': 'Morgan Bay Roan',
            'a_c_horse_mustang_reddunovero': 'Mustang Red Dun Overo',
            'a_c_horse_suffolkpunch_sorrel': 'Suffolk Punch Sorrel',
            'a_c_horse_turkoman_darkbay': 'Turkoman Dark Bay',
            'a_c_horse_turkoman_gold': 'Turkoman Gold',
            'a_c_horse_andalusian_rosegray': 'Andalusian Rose Gray',
            'a_c_horse_breton_redroan': 'Breton Red Roan',
            'a_c_horse_americanpaint_tobiano': 'American Paint Tobiano',
            // Colter
            'a_c_horse_gypsycob_splashedpiebald': 'Gypsy Cob Splashed Piebald',
            'a_c_horse_missourifoxtrotter_dapplegrey': 'Missouri Fox Trotter Dapple Gray',
            'a_c_horse_missourifoxtrotter_buckskinbrindle': 'Missouri Fox Trotter Buckskin Brindle',
            'a_c_horse_norfolkroadster_speckledgrey': 'Norfolk Roadster Speckled Gray',
            'a_c_horse_norfolkroadster_spottedtricolor': 'Norfolk Roadster Spotted Tricolor',
            'a_c_horse_breton_steelgrey': 'Breton Steel Grey',
            // Van Horn
            'a_c_horse_kladruber_black': 'Kladruber Black',
            'a_c_horse_hungarianhalfbred_liverchestnut': 'Hungarian Half-bred Liver Chestnut',
            'a_c_horse_kentuckysaddle_black': 'Kentucky Saddler Black',
            'a_c_horse_morgan_liverchestnut_pc': 'Morgan Liver Chestnut',
            'a_c_horse_thoroughbred_blackchestnut': 'Thoroughbred Black Chestnut',
            'a_c_horse_turkoman_silver': 'Turkoman Silver',
            // Saint Denis
            'a_c_horse_tennesseewalker_chestnut': 'Tennessee Walker Chestnut',
            'a_c_horse_tennesseewalker_goldpalomino_pc': 'Tennessee Walker Gold Palomino',
            'a_c_horse_americanstandardbred_lightbuckskin': 'American Standardbred Light Buckskin',
            'a_c_horse_tennesseewalker_flaxenroan': 'Tennessee Walker Flaxen Roan',
            'a_c_horse_tennesseewalker_redroan': 'Tennessee Walker Red Roan',
            'a_c_horse_kladruber_white': 'Kladruber White',
            // Rhodes
            'a_c_horse_morgan_flaxenchestnut': 'Morgan Flaxen Chestnut',
            'a_c_horse_kladruber_dapplerosegrey': 'Kladruber Dapple Rose Grey',
            'a_c_horse_kladruber_cremello': 'Kladruber Cremello',
            'a_c_horse_breton_sorrel': 'Breton Sorrel',
            'a_c_horse_ardennes_irongreyroan': 'Ardennes Iron Grey',
            'a_c_horse_shire_lightgrey': 'Shire Light Grey',
            // Strawberry
            'a_c_horse_arabian_white': 'Arabian White',
            'a_c_horse_belgian_blondchestnut': 'Belgian Draft Horse Blond Chestnut',
            'a_c_horse_gypsycob_whiteblagdon': 'Gypsy Cob White Blagdon',
            'a_c_horse_gypsycob_skewbald': 'Gypsy Cob Skewbald',
            'a_c_horse_americanpaint_splashedwhite': 'American Paint Splashed White',
            'a_c_horse_norfolkroadster_piebaldroan': 'Norfolk Roadster Piebald Roan',
            // Blackwater
            'a_c_horse_thoroughbred_dapplegrey': 'Thoroughbred Dapple Grey',
            'a_c_horse_mustang_grullodun': 'Mustang Grullo Dun',
            'a_c_horse_nokota_whiteroan': 'Nokota White Roan',
            'a_c_horse_nokota_blueroan': 'Nokota Blue Roan',
            'a_c_horse_kentuckysaddle_grey': 'Kentucky Saddler Grey',
            'a_c_horse_kentuckysaddle_chestnutpinto': 'Kentucky Saddler Chestnut Pinto',
            // Tumbleweed
            'a_c_horse_mustang_wildbay': 'Mustang Wild Bay',
            'a_c_horse_mustang_goldendun': 'Mustang Golden Dun',
            'a_c_horse_missourifoxtrotter_silverdapplepinto': 'Missouri Fox Trotter Silver Dapple Pinto',
            'a_c_horse_appaloosa_blanket': 'Appaloosa Blanket',
            'a_c_horse_appaloosa_brownleopard': 'Appaloosa Brown Leopard',
            'a_c_horse_americanstandardbred_palominodapple': 'American Standardbred Palomino Dapple',
            'a_c_horse_americanstandardbred_silvertailbuckskin': 'American Standardbred Silver Tail Buckskin',
            'a_c_horse_belgian_mealychestnut': 'Belgian Draft Horse Mealy Chestnut',
            'a_c_horse_breton_grullodun': 'Breton Grullo Dun',
            'a_c_horse_criollo_sorrelovero': 'Criollo Sorrel Overo',
            'a_c_horse_criollo_dun': 'Criollo Dun',
        };

        return horseNames[model] || model || 'Unknown';
    },
};

module.exports = utils;
