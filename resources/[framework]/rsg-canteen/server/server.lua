local RSGCore = exports['rsg-core']:GetCoreObject()

------------------------
-- use canteen 100
------------------------
RSGCore.Functions.CreateUseableItem('canteen100', function(source, item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end
    TriggerClientEvent('rsg-canteen:client:drink', src, Config.DrinkAmount, 'canteen100')
end)

------------------------
-- use canteen 75
------------------------
RSGCore.Functions.CreateUseableItem('canteen75', function(source, item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end
    TriggerClientEvent('rsg-canteen:client:drink', src, Config.DrinkAmount, 'canteen75')
end)

------------------------
-- use canteen 50
------------------------
RSGCore.Functions.CreateUseableItem('canteen50', function(source, item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end
    TriggerClientEvent('rsg-canteen:client:drink', src, Config.DrinkAmount, 'canteen50')
end)

------------------------
-- use canteen 25
------------------------
RSGCore.Functions.CreateUseableItem('canteen25', function(source, item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end
    TriggerClientEvent('rsg-canteen:client:drink', src, Config.DrinkAmount, 'canteen25')
end)

------------------------
-- use canteen 0
------------------------
RSGCore.Functions.CreateUseableItem('canteen0', function(source, item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
	TriggerClientEvent('rsg-canteen:client:fillupcanteen', src)
    if not Player then return end
    TriggerClientEvent('rsg-canteen:client:drink', src, Config.DrinkAmount, 'canteen0')
end)

------------------------
-- Refill Handler
------------------------
local function RefillCanteen(src, fromItem)
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end
    Player.Functions.RemoveItem(fromItem, 1)
    TriggerClientEvent('rsg-inventory:client:ItemBox', src, RSGCore.Shared.Items[fromItem], 'remove', 1)
    Player.Functions.AddItem('canteen100', 1)
    TriggerClientEvent('rsg-inventory:client:ItemBox', src, RSGCore.Shared.Items['canteen100'], 'add', 1)
end

------------------------
-- give full canteen from 0
------------------------
RegisterServerEvent('rsg-canteen:server:givefullcanteen')
AddEventHandler('rsg-canteen:server:givefullcanteen', function()
    RefillCanteen(source, 'canteen0')
end)

------------------------
-- give full canteen from 25
------------------------
RegisterServerEvent('rsg-canteen:server:givefullcanteen25')
AddEventHandler('rsg-canteen:server:givefullcanteen25', function()
    RefillCanteen(source, 'canteen25')
end)

------------------------
-- give full canteen from 50
------------------------
RegisterServerEvent('rsg-canteen:server:givefullcanteen50')
AddEventHandler('rsg-canteen:server:givefullcanteen50', function()
    RefillCanteen(source, 'canteen50')
end)

------------------------
-- give full canteen from 75
------------------------
RegisterServerEvent('rsg-canteen:server:givefullcanteen75')
AddEventHandler('rsg-canteen:server:givefullcanteen75', function()
    RefillCanteen(source, 'canteen75')
end)

------------------------
-- Handle degrade logic
------------------------
RegisterServerEvent('rsg-canteen:server:degradecanteen')
AddEventHandler('rsg-canteen:server:degradecanteen', function(item)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end

    local downgradeMap = {
        canteen100 = 'canteen75',
        canteen75 = 'canteen50',
        canteen50 = 'canteen25',
        canteen25 = 'canteen0'
    }

    local nextItem = downgradeMap[item]
    if not nextItem then return end

    Player.Functions.RemoveItem(item, 1)
    TriggerClientEvent('rsg-inventory:client:ItemBox', src, RSGCore.Shared.Items[item], 'remove', 1)
    Player.Functions.AddItem(nextItem, 1)
    TriggerClientEvent('rsg-inventory:client:ItemBox', src, RSGCore.Shared.Items[nextItem], 'add', 1)
end)

------------------------
-- External Refill Entry Point
------------------------
RegisterServerEvent('rsg-canteen:server:refillcanteen')
AddEventHandler('rsg-canteen:server:refillcanteen', function(fromItem)
    local src = source
    local valid = {
        canteen0 = true,
        canteen25 = true,
        canteen50 = true,
        canteen75 = true
    }

    if not valid[fromItem] then
        print(('[rsg-canteen] Invalid refill attempt from item: %s'):format(fromItem))
        return
    end

    RefillCanteen(src, fromItem)
end)
