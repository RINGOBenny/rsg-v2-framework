fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'

description 'rsg-discord - Discord Moderator Bot Integration'
version '2.0.0'

author 'RSG Framework'

-- Node.js server script
server_script 'server/main.js'

-- Client script
client_script 'client/main.js'

-- Shared configuration
shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua',
}

-- Dependencies
dependencies {
    '/server:7290',
}
-- Files
files {
    'package.json',
    'config.js',
    'server/utils.js',
    'server/commands/*.js',
}

lua54 'yes'

dependency 'ox_lib'
