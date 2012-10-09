{ ExtComponentManager, ExtComponent } = require('./ext-component')
ExtConfig = require('./ext-config')
ExtFormat = require('./ext-format')

class ExtBuilder
    constructor: (@schema) ->

    emitRequires: () ->
        reqs = []
        for v in ExtComponentManager.requires()
            reqs.push(ExtFormat.require(v))

        return "Ext.require([ #{reqs.join(", ")} ])"

    emitComponents: () ->

    build: () ->

module.exports = ExtBuilder