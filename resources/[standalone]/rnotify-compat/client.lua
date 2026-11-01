RegisterNetEvent('rNotify:NotifyLeft', function(title, description, _, _, duration)
    lib.notify({ title = title, description = description, duration = duration or 5000 })
end)
