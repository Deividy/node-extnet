{ ExtComponentManager, ExtComponent } = require('./ext-component')
ExtConfig = require('./ext-config')

class ExtBuilder
    constructor: (@schema) ->

    emitRequires: (f) ->
        reqs = []
        for v in ExtComponentManager.requires()
            reqs.push(v)

        return f.emitRequires(reqs)

    emitComponents: () ->

    build: () ->

module.exports = ExtBuilder