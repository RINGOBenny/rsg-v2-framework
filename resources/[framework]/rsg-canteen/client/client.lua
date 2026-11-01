local RSGCore = exports['rsg-core']:GetCoreObject()
local isBusy = false
local entity = nil
lib.locale()

------------------------
-- function load model
------------------------
local function LoadModel(modelHash)
    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Wait(100)
    end
end

------------------------
-- drink water from flask
------------------------
RegisterNetEvent('rsg-canteen:client:drink', function(amount, item)
    if isBusy then return end
    isBusy = true

    local coords = GetEntityCoords(cache.ped)
    local water = GetWaterMapZoneAtCoords(coords.x + 3, coords.y + 3, coords.z)
    local isValidWater = false
    local refillable = item == 'canteen0' or item == 'canteen25' or item == 'canteen50' or item == 'canteen75'

    for _, v in pairs(Config.WaterTypes) do
        if water == v.waterhash then
            isValidWater = true
            break
        end
    end

    -- Early block: prevent drinking from empty canteen in invalid water
    if item == 'canteen0' and (not isValidWater or not IsEntityInWater(cache.ped)) then
        lib.notify({
            title = locale('cl_lang_1'),
            description = locale('cl_lang_2'),
            type = 'error',
            duration = 7000
        })
        isBusy = false
        return
    end

    -- Animation setup
    SetCurrentPedWeapon(cache.ped, joaat('weapon_unarmed'))
    Wait(100)

    if not IsPedOnMount(cache.ped) and not IsPedInAnyVehicle(cache.ped) then
        local dict = 'amb_rest_drunk@world_human_drinking@female_a@idle_a'
        local anim = 'idle_a'
        local boneIndex = GetEntityBoneIndexByName(cache.ped, 'SKEL_R_HAND')
        local modelHash = GetHashKey('p_cs_canteen_hercule')

        LoadModel(modelHash)
        entity = CreateObject(modelHash, coords.x + 0.3, coords.y, coords.z, true, false, false)
        SetEntityVisible(entity, true)
        SetEntityAlpha(entity, 255, false)
        Citizen.InvokeNative(0x283978A15512B2FE, entity, true)
        SetModelAsNoLongerNeeded(modelHash)
        AttachEntityToEntity(entity, cache.ped, boneIndex, 0.10, 0.09, -0.05, 306.0, 18.0, 0.0, true, true, false, true, 2, true)

        if isValidWater and refillable and IsPedOnFoot(cache.ped) and IsEntityInWater(cache.ped) then
            TaskStartScenarioInPlace(cache.ped, joaat('WORLD_HUMAN_CROUCH_INSPECT'), -1, true, false, false, false)
            Wait(8000)
            ClearPedTasks(cache.ped)
        end

        RequestAnimDict(dict)
        while not HasAnimDictLoaded(dict) do
            Citizen.Wait(100)
        end
        TaskPlayAnim(cache.ped, dict, anim, 1.0, 1.0, -1, 31, 1.0, false, false, false)
    end

    Wait(5000)

    -- Decision logic: refill, degrade, or block
    local inWater = IsEntityInWater(cache.ped)
    local shouldRefill = isValidWater and refillable and inWater
    local shouldDegrade = not refillable or not inWater

    if shouldRefill then
        TriggerServerEvent("RSGCore:Server:SetMetaData", "thirst", RSGCore.Functions.GetPlayerData().metadata["thirst"] + 100)

        if item == 'canteen0' then
            TriggerServerEvent('rsg-canteen:server:givefullcanteen')
        elseif item == 'canteen25' then
            TriggerServerEvent('rsg-canteen:server:givefullcanteen25')
        elseif item == 'canteen50' then
            TriggerServerEvent('rsg-canteen:server:givefullcanteen50')
        elseif item == 'canteen75' then
            TriggerServerEvent('rsg-canteen:server:givefullcanteen75')
        end

        TriggerEvent('hud:client:UpdateThirst', LocalPlayer.state.thirst + amount)

    elseif shouldDegrade then
        TriggerServerEvent('rsg-canteen:server:degradecanteen', item)
        TriggerEvent('hud:client:UpdateThirst', LocalPlayer.state.thirst + amount)

    else
        -- This case: refillable canteen, not in water, no degrade
        if item == 'canteen0' then
            lib.notify({
                title = locale('cl_lang_1'),
                description = locale('cl_lang_2'),
                type = 'error',
                duration = 7000
            })
        end
    end

    -- Cleanup
    ClearPedTasks(cache.ped)
    if entity then
        DeleteObject(entity)
        entity = nil
    end
    isBusy = false
end)
