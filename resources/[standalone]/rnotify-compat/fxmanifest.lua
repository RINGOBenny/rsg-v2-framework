fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'
lua54 'yes'

description 'Shows rNotify:NotifyLeft events through ox_lib'
version '1.0.0'

shared_script '@ox_lib/init.lua'
client_script 'client.lua'

dependency 'ox_lib'
