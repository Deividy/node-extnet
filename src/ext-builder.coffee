{ ExtComponentManager, ExtComponent } = require('./ext-component')
ExtConfig = require('./ext-config')
ExtLoader = require('./ext-loade')

class ExtBuilder
    constructor: (@schema) ->

    emitRequire: () ->
        reqs = []
        for v in ExtComponentManager.requires()
            reqs.push(v)
        return reqs

    emitComponent: () ->

    emitLoader: () ->
        l = new ExtLoader(ExtComponentManager.requires)
        return l.emit()

    build: () ->

module.exports = ExtBuilder