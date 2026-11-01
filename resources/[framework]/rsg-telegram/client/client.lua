local RSGCore = exports['rsg-core']:GetCoreObject()
lib.locale()

local cuteBird = nil
local birdBlip = nil
local howFar = 0
local blipEntries = {}

-- Builds the NUI label table from ox_lib locales before sending it to the browser.
local function BuildUiLabels()
    return {
        ui_page_title = locale('ui_page_title'),
        ui_header_title = locale('ui_header_title'),
        ui_inbox = locale('ui_inbox'),
        ui_job_inbox = locale('ui_job_inbox'),
        ui_new_message = locale('ui_new_message'),
        ui_addressbook = locale('ui_addressbook'),
        ui_search_messages = locale('ui_search_messages'),
        ui_search_job_messages = locale('ui_search_job_messages'),
        ui_clear_search = locale('ui_clear_search'),
        ui_sender_label = locale('ui_sender_label'),
        ui_personal_sender = locale('ui_personal_sender'),
        ui_recipient_label = locale('ui_recipient_label'),
        ui_recipient_placeholder = locale('ui_recipient_placeholder'),
        ui_subject_label = locale('ui_subject_label'),
        ui_subject_placeholder = locale('ui_subject_placeholder'),
        ui_message_label = locale('ui_message_label'),
        ui_message_placeholder = locale('ui_message_placeholder'),
        ui_send_message = locale('ui_send_message'),
        ui_clear = locale('ui_clear'),
        ui_add_new_contact = locale('ui_add_new_contact'),
        ui_contact_name_label = locale('ui_contact_name_label'),
        ui_contact_name_placeholder = locale('ui_contact_name_placeholder'),
        ui_contact_citizenid_label = locale('ui_contact_citizenid_label'),
        ui_contact_citizenid_placeholder = locale('ui_contact_citizenid_placeholder'),
        ui_save_contact = locale('ui_save_contact'),
        ui_cancel = locale('ui_cancel'),
        ui_confirm_send_title = locale('ui_confirm_send_title'),
        ui_confirm_send_text = locale('ui_confirm_send_text'),
        ui_note_label = locale('ui_note_label'),
        ui_birdpost_warning = locale('ui_birdpost_warning'),
        ui_cost_label = locale('ui_cost_label'),
        ui_cost_warning = locale('ui_cost_warning'),
        ui_message_details = locale('ui_message_details'),
        ui_from_label = locale('ui_from_label'),
        ui_to_label = locale('ui_to_label'),
        ui_date_label = locale('ui_date_label'),
        ui_reply = locale('ui_reply'),
        ui_delete = locale('ui_delete'),
        ui_close = locale('ui_close'),
        ui_empty_inbox = locale('ui_empty_inbox'),
        ui_empty_job_inbox = locale('ui_empty_job_inbox'),
        ui_at_post_office = locale('ui_at_post_office'),
        ui_job_badge = locale('ui_job_badge'),
        ui_empty_addressbook = locale('ui_empty_addressbook'),
        ui_citizenid_display = locale('ui_citizenid_display'),
        ui_remove_contact = locale('ui_remove_contact'),
        ui_reply_subject_prefix = locale('ui_reply_subject_prefix')
    }
end

-- Centralizes NUI open payload so every entry point receives the same localized UI data.
local function OpenTelegramUiPayload(extraData)
    local payload = extraData or {}
    payload.action = 'openUI'
    payload.enableJobMailboxes = Config.EnableJobMailboxes
    payload.personalSenderDisplay = Config.PersonalSenderDisplay
    payload.jobAliases = Config.JobRecipients or {}
    payload.labels = BuildUiLabels()
    payload.citizenid = RSGCore.Functions.GetPlayerData().citizenid
    return payload
end

-- Plays the notebook-writing scenario on the local player for as long as the telegram UI has focus.
local function StartTelegramWritingAnim()
    Citizen.InvokeNative(0x524B54361229154F, PlayerPedId(), GetHashKey('world_human_write_notebook'), 9999999999, true, false, false, false)
end

local function StopTelegramWritingAnim()
    ClearPedTasks(PlayerPedId())
end

-- Check if player is at post office
local function IsPlayerAtPostOffice()
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    
    for _, location in pairs(Config.PostOfficeLocations) do
        local distance = #(playerCoords - location.coords)
        if distance < 5.0 then -- Within 5 units of post office
            return true
        end
    end
    
    return false
end

---@deprecated use state LocalPlayer.state.telegramIsBirdPostApproaching
exports('IsBirdPostApproaching', function()
    return LocalPlayer.state.telegramIsBirdPostApproaching
end)

CreateThread(function() 
    LocalPlayer.state.telegramIsBirdPostApproaching = false
    repeat Wait(100) until LocalPlayer.state.isLoggedIn

    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getTelegramsAmount', function(amount)
        LocalPlayer.state:set('telegramUnreadMessages', amount or 0, true)
    end)
end)



-- Prompts
Citizen.CreateThread(function()
    for i = 1, #Config.PostOfficeLocations do
        local pos = Config.PostOfficeLocations[i]

        -- Prompt to open telegram
        exports['rsg-core']:createPrompt(pos.location, pos.coords, RSGCore.Shared.Keybinds['J'], locale("cl_prompt") ..' '.. pos.name, {
            type = 'client',
            event = 'rsg-telegram:client:OpenTelegram'
        })
        
        -- Prompt to pick up waiting messages
        exports['rsg-core']:createPrompt(pos.location .. '_pickup', pos.coords, RSGCore.Shared.Keybinds['G'], locale('cl_pickup_mail_prompt'), {
            type = 'client',
            event = 'rsg-telegram:client:PickupMessages'
        })

        if pos.showblip == true then
            PostOfficeBlip = BlipAddForCoords(1664425300, pos.coords)
            SetBlipSprite(PostOfficeBlip, joaat(pos.blipsprite), true)
            SetBlipScale(PostOfficeBlip, pos.blipscale)
            SetBlipName(PostOfficeBlip, pos.name)

            blipEntries[#blipEntries + 1] = { type = "BLIP", handle = PostOfficeBlip }
        end
    end
end)

-- Open Telegram UI
RegisterNetEvent('rsg-telegram:client:OpenTelegram', function()
    SetNuiFocus(true, true)
    StartTelegramWritingAnim()
    SendNUIMessage(OpenTelegramUiPayload())
end)

-- Pick up messages from post office
RegisterNetEvent('rsg-telegram:client:PickupMessages', function()
    -- Check if player is at post office
    if not IsPlayerAtPostOffice() then
        lib.notify({
            title = locale("cl_title_11"),
            description = locale('cl_must_be_at_post_office'),
            type = 'error',
            duration = 5000
        })
        return
    end
    
    -- Check for waiting messages
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:checkWaitingMessages', function(count)
        if count > 0 then
            -- Show confirmation with count
            lib.notify({
                title = locale('cl_post_office_title'),
                description = locale('cl_waiting_mail_pickup', count),
                type = 'info',
                duration = 5000
            })
            
            -- Pick up messages
            TriggerServerEvent('rsg-telegram:server:pickupMessages')
        else
            lib.notify({
                title = locale("cl_title_11"),
                description = locale('cl_no_waiting_mail'),
                type = 'info',
                duration = 5000
            })
        end
    end)
end)



-- Set Bird Attribute
local SetPetAttributes = function(entity)
    -- SET_ATTRIBUTE_POINTS
    Citizen.InvokeNative(0x09A59688C26D88DF, entity, 0, 1100)
    Citizen.InvokeNative(0x09A59688C26D88DF, entity, 1, 1100)
    Citizen.InvokeNative(0x09A59688C26D88DF, entity, 2, 1100)

    -- ADD_ATTRIBUTE_POINTS
    Citizen.InvokeNative(0x75415EE0CB583760, entity, 0, 1100)
    Citizen.InvokeNative(0x75415EE0CB583760, entity, 1, 1100)
    Citizen.InvokeNative(0x75415EE0CB583760, entity, 2, 1100)

    -- SET_ATTRIBUTE_BASE_RANK
    Citizen.InvokeNative(0x5DA12E025D47D4E5, entity, 0, 10)
    Citizen.InvokeNative(0x5DA12E025D47D4E5, entity, 1, 10)
    Citizen.InvokeNative(0x5DA12E025D47D4E5, entity, 2, 10)

    -- SET_ATTRIBUTE_BONUS_RANK
    Citizen.InvokeNative(0x920F9488BD115EFB, entity, 0, 10)
    Citizen.InvokeNative(0x920F9488BD115EFB, entity, 1, 10)
    Citizen.InvokeNative(0x920F9488BD115EFB, entity, 2, 10)

    -- SET_ATTRIBUTE_OVERPOWER_AMOUNT
    Citizen.InvokeNative(0xF6A7C08DF2E28B28, entity, 0, 5000.0, false)
    Citizen.InvokeNative(0xF6A7C08DF2E28B28, entity, 1, 5000.0, false)
    Citizen.InvokeNative(0xF6A7C08DF2E28B28, entity, 2, 5000.0, false)
end



-- Place Ped on Ground Properly
local PlacePedOnGroundProperly = function(hPed, howfar)
    local playerPed = PlayerPedId()
    howFar = howfar
    local x, y, z = table.unpack(GetEntityCoords(playerPed))
    local found, groundz, normal = GetGroundZAndNormalFor_3dCoord(x - howFar, y, z)

    if found then
        SetEntityCoordsNoOffset(hPed, x - howFar, y, groundz + normal.z + howFar, true)
    end
end

-- Spawn the Bird Post
local SpawnBirdPost = function(posX, posY, posZ, heading, rfar, x)
    local birdHash = joaat(Config.BirdModel)
    cuteBird = CreatePed(birdHash, posX, posY, posZ, heading, true, true, false)

    SetPetAttributes(cuteBird)

    Citizen.InvokeNative(0x013A7BA5015C1372, cuteBird, true) -- SetPedIgnoreDeadBodies
    Citizen.InvokeNative(0xAEB97D84CDF3C00B, cuteBird, false) -- SetAnimalIsWild

    SetRelationshipBetweenGroups(1, GetPedRelationshipGroupHash(cuteBird), GetHashKey('PLAYER'))

    PlacePedOnGroundProperly(cuteBird, rfar)

    Wait(2000)

    Citizen.InvokeNative(0x283978A15512B2FE, cuteBird, true) -- SetRandomOutfitVariation
    ClearPedTasks(cuteBird)
    ClearPedSecondaryTask(cuteBird)
    ClearPedTasksImmediately(cuteBird)
    SetPedFleeAttributes(cuteBird, 0, 0)
    TaskWanderStandard(cuteBird, 0, 0)
    TaskSetBlockingOfNonTemporaryEvents(cuteBird, 1)
    SetEntityAsMissionEntity(cuteBird, true, true)
    Citizen.InvokeNative(0xA5C38736C426FCB8, cuteBird, true) -- SetEntityInvincible

    Wait(2000)

    if x == 0 then
        local blipname = locale("cl_blip_name")
        local bliphash = -1749618580

        Debug("bliphash", bliphash)

        birdBlip = Citizen.InvokeNative(0x23F74C2FDA6E7C61, bliphash, cuteBird) -- BlipAddForEntity
        Citizen.InvokeNative(0x9CB1A1623062F402, birdBlip, blipname) -- SetBlipName
        -- Citizen.InvokeNative(0x931B241409216C1F, targetPed, cuteBird, true) -- SetPedOwnsAnimal
        Citizen.InvokeNative(0x0DF2B55F717DDB10, birdBlip) -- SetBlipFlashes
        Citizen.InvokeNative(0x662D364ABF16DE2F, birdBlip, GetHashKey("BLIP_MODIFIER_DEBUG_BLUE")) -- BlipAddModifier
        SetBlipScale(birdBlip, 2.0)
    end
end

-- Write the Message (when using bird post item)
RegisterNetEvent('rsg-telegram:client:WriteMessage', function()
    -- Open custom UI to new message tab
    SetNuiFocus(true, true)
    StartTelegramWritingAnim()
    SendNUIMessage(OpenTelegramUiPayload({
        defaultTab = 'new-message',
        usingBirdPost = true
    }))
end)

-- Spawn Bird for Sending Message
RegisterNetEvent('rsg-telegram:client:SpawnBirdForSend', function()
    local ped = PlayerPedId()
    
    if IsPedOnMount(ped) or IsPedOnVehicle(ped) then
        lib.notify({ title = locale("cl_title_11"), description = locale('cl_player_on_horse'), type = 'error', duration = 7000 })
        return
    end
    
    -- Request validation from server (will check item and send callback if valid)
    TriggerServerEvent('rsg-telegram:server:ValidateBirdPostSend', messageData.sender, messageData.sendername, messageData.recipient, messageData.subject, messageData.message, messageData.jobSender)
end)

-- Server validated bird post send, spawn the bird
RegisterNetEvent('rsg-telegram:client:StartBirdDelivery', function(targetCoords)
    local ped = PlayerPedId()
    local pID = PlayerId()
    local playerCoords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    
    -- Freeze player
    ClearPedTasks(ped)
    ClearPedSecondaryTask(ped)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    
    -- Step 1: Take out notebook for 2 seconds
    Citizen.InvokeNative(0x524B54361229154F, ped, joaat('WORLD_HUMAN_WRITE_NOTEBOOK'), -1, true) -- TaskStartScenarioInPlace
    Wait(2000)
    
    -- Step 2: Clear notebook animation and sit down
    ClearPedTasks(ped)
    Wait(100)
    
    -- Make player sit/kneel down (using crouch or a sitting scenario)
    Citizen.InvokeNative(0x524B54361229154F, ped, joaat('WORLD_HUMAN_CROUCH_INSPECT'), -1, true) -- TaskStartScenarioInPlace
    Wait(500)
    
    -- Step 3: Spawn bird in front of player's feet (0.5 distance)
    local forwardX = playerCoords.x + (math.sin(math.rad(heading)) * 0.5)
    local forwardY = playerCoords.y + (math.cos(math.rad(heading)) * 0.5)
    local groundZ = playerCoords.z
    
    -- Spawn bird at ground level in front of player
    SpawnBirdPost(forwardX, forwardY, groundZ, heading, 0.5, 0)
    
    if cuteBird == nil then
        lib.notify({ title = locale("cl_title_11"), description = locale("cl_title_14"), type = 'error', duration = 7000 })
        FreezeEntityPosition(ped, false)
        SetEntityInvincible(ped, false)
        ClearPedTasks(ped)
        return
    end
    
    -- Make bird face same direction as player
    SetEntityHeading(cuteBird, heading)
    SetEntityCollision(cuteBird, true, true)
    FreezeEntityPosition(cuteBird, true)
    SetBlockingOfNonTemporaryEvents(cuteBird, true)
    
    -- Wait for bird to "pick up" the letter (3 seconds)
    Wait(3000)
    
    lib.notify({ title = locale("cl_title_13"), description = locale('cl_bird_collecting_mail'), type = 'info', duration = 3000 })
    
    -- Step 4: Bird flies away
    FreezeEntityPosition(cuteBird, false)
    SetEntityInvincible(cuteBird, false)
    SetBlockingOfNonTemporaryEvents(cuteBird, false)
    
    -- First make bird hop/fly up a bit
    local flyUpCoords = GetEntityCoords(cuteBird)
    Citizen.InvokeNative(0xD1C8F216, cuteBird, 1, flyUpCoords.x, flyUpCoords.y, flyUpCoords.z + 5.0, 1, 0) -- TaskFlyToCoord - fly up
    Wait(2000)
    
    -- Make bird fly to target destination
    local coordsOffset = math.random(200, 300)
    Citizen.InvokeNative(0xD1C8F216, cuteBird, 1, targetCoords.x - coordsOffset, targetCoords.y - coordsOffset, targetCoords.z + 75, 1, 0) -- TaskFlyToCoord
    
    -- Unfreeze player
    Wait(1000)
    FreezeEntityPosition(ped, false)
    SetEntityInvincible(ped, false)
    ClearPedTasks(ped)
    ClearPedSecondaryTask(ped)
    
    -- Wait for bird arrival delay
    Wait(Config.BirdArrivalDelay or 5000)
    
    -- Cleanup bird
    SetEntityInvincible(cuteBird, false)
    FreezeEntityPosition(cuteBird, false)
    SetEntityCanBeDamaged(cuteBird, true)
    SetEntityAsMissionEntity(cuteBird, false, false)
    SetEntityAsNoLongerNeeded(cuteBird)
    DeleteEntity(cuteBird)
    
    if birdBlip ~= nil then
        RemoveBlip(birdBlip)
    end
end)

-- Read the Message
RegisterNetEvent('rsg-telegram:client:ReadMessages')
AddEventHandler('rsg-telegram:client:ReadMessages', function()
    InMenu = true
    SetNuiFocus(true, true)

    SendNUIMessage
    ({
        type = 'openGeneral'
    })

    TriggerServerEvent('rsg-telegram:server:CheckInbox')
end)

-- Show Messages List
RegisterNetEvent('rsg-telegram:client:InboxList')
AddEventHandler('rsg-telegram:client:InboxList', function(data)
    SendNUIMessage
    ({
        type = 'inboxlist', response = data
    })
end)

-- Get the Message
RegisterNUICallback('getview', function(data)
    TriggerServerEvent('rsg-telegram:server:GetMessages', tonumber(data.id))
    TriggerServerEvent('rsg-telegram:server:CheckInbox')
end)

-- Get the Message all 
RegisterNUICallback('getviewall', function(data, cb)
    local ids = data.ids
    for _, id in ipairs(ids) do
        TriggerServerEvent('rsg-telegram:server:GetMessages', tonumber(id))
    end
    TriggerServerEvent('rsg-telegram:server:CheckInbox')
    cb('ok')
end)

-- Message Data
RegisterNetEvent('rsg-telegram:client:MessageData')
AddEventHandler('rsg-telegram:client:MessageData', function(tele)
    SendNUIMessage
    ({
        type = 'view',
        telegram = tele
    })
end)

-- Delete Message
RegisterNUICallback('delete', function(data)
    TriggerServerEvent('rsg-telegram:server:DeleteMessage', tonumber(data.id))
    TriggerServerEvent('rsg-telegram:server:CheckInbox')
end)

-- Delete Message all
RegisterNUICallback('deleteall', function(data, cb)
    local ids = data.ids  -- Un array de IDs
    for _, id in ipairs(ids) do
        TriggerServerEvent('rsg-telegram:server:DeleteMessage', tonumber(id))
    end
    TriggerServerEvent('rsg-telegram:server:CheckInbox')
    cb('ok')
end)

RegisterNUICallback('copymsg', function(data, cb)
    local id = data.id
    local message = data.message

    cb({ success = true, message = message })
end)

-- Close Mailbox
RegisterNUICallback('NUIFocusOff', function()
    InMenu = false
    SetNuiFocus(false, false)

    SendNUIMessage
    ({
        type = 'closeAll'
    })
end)

-- Cleanup
AddEventHandler("onResourceStop", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    StopTelegramWritingAnim()

    if birdBlip ~= nil then
        RemoveBlip(birdBlip)
    end

    SetEntityAsMissionEntity(cuteBird, false)
    FreezeEntityPosition(cuteBird, false)
    DeleteEntity(cuteBird)

    for i = 1, #Config.PostOfficeLocations do
        local pos = Config.PostOfficeLocations[i]

        exports['rsg-core']:deletePrompt(pos.location)
        exports['rsg-core']:deletePrompt(pos.location .. '_pickup')
    end

    for i = 1, #blipEntries do
        if blipEntries[i].type == "BLIP" then
            RemoveBlip(blipEntries[i].handle)
        end
    end
end)

-- ================================
-- NUI Callbacks for Custom UI
-- ================================

-- Close UI
RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    StopTelegramWritingAnim()
    cb('ok')
end)

-- Check if player is at post office
RegisterNUICallback('checkLocation', function(data, cb)
    local atPostOffice = IsPlayerAtPostOffice()
    cb({
        atPostOffice = atPostOffice,
        chargePlayer = Config.ChargePlayer,
        cost = Config.CostPerLetter
    })
end)

-- Get Inbox Messages
RegisterNUICallback('getInbox', function(data, cb)
    local atPostOffice = IsPlayerAtPostOffice()
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getInbox', function(messages)
        cb(messages or {})
    end, atPostOffice)
end)

-- Get Job Inbox Messages
RegisterNUICallback('getJobInbox', function(data, cb)
    local atPostOffice = IsPlayerAtPostOffice()
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getJobInbox', function(messages)
        cb(messages or {})
    end, atPostOffice)
end)

-- Get Addressbook
RegisterNUICallback('getAddressbook', function(data, cb)
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getAddressbook', function(contacts)
        cb(contacts or {})
    end)
end)

-- Get All Players for Recipient List
RegisterNUICallback('getPlayers', function(data, cb)
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getAddressbook', function(contacts)
        RSGCore.Functions.TriggerCallback('rsg-telegram:server:getJobRecipients', function(jobRecipients)
            -- Job recipients are appended to contacts so aliases like "sheriff" can be selected like a normal recipient.
            local recipients = contacts or {}

            for _, recipient in ipairs(jobRecipients or {}) do
                recipients[#recipients + 1] = recipient
            end

            cb(recipients)
        end)
    end)
end)

-- Get job mailboxes this player can use as a sender.
RegisterNUICallback('getJobSenders', function(data, cb)
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:getJobSenders', function(senders)
        cb(senders or {})
    end)
end)

-- Send Message
RegisterNUICallback('sendMessage', function(data, cb)
    -- Close UI first
    SetNuiFocus(false, false)
    StopTelegramWritingAnim()
    SendNUIMessage({
        action = 'closeUI'
    })
    
    local atPostOffice = IsPlayerAtPostOffice()
    
    -- Get sender info
    local pID = PlayerId()
    local senderID = GetPlayerServerId(pID)
    local senderfirstname = RSGCore.Functions.GetPlayerData().charinfo.firstname
    local senderlastname = RSGCore.Functions.GetPlayerData().charinfo.lastname
    local sendertelegram = RSGCore.Functions.GetPlayerData().citizenid
    local senderfullname = senderfirstname..' '..senderlastname
    
    -- If not at post office, trigger bird spawn flow
    if not atPostOffice then
        -- Store message data for bird delivery
        messageData = {
            sender = sendertelegram,
            sendername = senderfullname,
            recipient = data.recipient,
            subject = data.subject,
            message = data.message,
            jobSender = data.jobSender
        }
        
        -- Trigger bird spawn event (will check item and spawn bird)
        TriggerEvent('rsg-telegram:client:SpawnBirdForSend')
    else
        -- At post office, send normally without bird
        TriggerServerEvent('rsg-telegram:server:SendMessagePostOffice', sendertelegram, senderfullname, data.recipient, data.subject, data.message, data.jobSender)
    end
    
    cb('ok')
end)

-- Mark Message as Read
RegisterNUICallback('markAsRead', function(data, cb)
    TriggerServerEvent('rsg-telegram:server:MarkAsRead', tonumber(data.id))
    cb('ok')
end)

-- Delete Message
RegisterNUICallback('deleteMessage', function(data, cb)
    TriggerServerEvent('rsg-telegram:server:DeleteMessage', tonumber(data.id))
    cb('ok')
end)

-- Add Contact to Addressbook
RegisterNUICallback('addContact', function(data, cb)
    TriggerServerEvent('rsg-telegram:server:SavePerson', data.name, data.citizenid)
    cb('ok')
end)

-- Remove Contact from Addressbook
RegisterNUICallback('removeContact', function(data, cb)
    TriggerServerEvent('rsg-telegram:server:RemovePerson', data.citizenid)
    cb('ok')
end)

-- AddressBook (Legacy - kept for backward compatibility)
RegisterNetEvent('rsg-telegram:client:OpenAddressbook', function()
    -- Open custom UI to addressbook tab
    SetNuiFocus(true, true)
    StartTelegramWritingAnim()
    SendNUIMessage(OpenTelegramUiPayload({
        defaultTab = 'addressbook'
    }))
end)


RegisterNetEvent('rsg-telegram:client:AddPersonMenu', function()
    local input = lib.inputDialog(locale("cl_title_24"), {
        { type = 'input', label = locale("cl_title_25"),      required = true },
        { type = 'input', label = locale("cl_title_26"), required = true },
    })
    if not input then return end

    local name = input[1]
    local cid = input[2]
    if name and cid then
        TriggerServerEvent('rsg-telegram:server:SavePerson', name, cid)
    end
end)

RegisterNetEvent('rsg-telegram:client:ViewAddressBook', function()
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:GetPlayers', function(players)
        if players ~= nil then
            local options = {
                {
                    title = locale("cl_title_27"),
                    description = locale("cl_title_28"),
                    icon = 'fa-solid fa-envelope-open-text',
                    isMenuHeader = true,
                },
            }
            for i = 1, #players do
                local player = players[i]
                options[#options + 1] = {
                    title = player.name,
                    description = locale("cl_title_29") .. player.citizenid,
                    disabled = true
                }
            end
            options[#options + 1] = {
                title = locale("cl_title_30"),
                description = locale("cl_title_31"),
                icon = 'fa-solid fa-circle-xmark',
                event = 'rsg-telegram:client:OpenAddressbook',
                args = {
                    isServer = false
                }
            }
            lib.registerContext({
                id = 'addressbook_view',  -- Corrected the context ID here
                title = locale("cl_title_32"),
                position = 'top-right',
                options = options
            })
            lib.showContext('addressbook_view')  -- Use the correct context ID here
        else
            lib.notify({ title = locale("cl_title_33"), description = locale("cl_title_34"), type = 'error', duration = 7000 })
        end
    end)
end)

RegisterNetEvent('rsg-telegram:client:RemovePersonMenu', function()
    RSGCore.Functions.TriggerCallback('rsg-telegram:server:GetPlayers', function(players)
        if players ~= nil then
            local option = {}
            for i = 1, #players do
                local citizenid = players[i].citizenid
                local fullname = players[i].name
                local content = { value = citizenid, label = fullname .. ' (' .. citizenid .. ')' }
                option[#option + 1] = content
            end

            local input = lib.inputDialog(locale("cl_title_35"), {
                { type = 'select', options = option, required = true, default = locale('ui_recipient') }
            })
            if not input then return end

            local citizenid = input[1]
            if citizenid then
                TriggerServerEvent('rsg-telegram:server:RemovePerson', citizenid)
            end
        else
            lib.notify({ title = locale("cl_title_36"), description = locale("cl_title_37"), type = 'error', duration = 7000 })
        end
    end)
end)
