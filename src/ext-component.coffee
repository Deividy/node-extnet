_ = require('underscore')
ExtJsFormatter = require('./extjs-formatter')
config = require('./ext-config.json')

class ExtComponentManager
    components = []

    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @components: () -> components

    @clean: () ->
        components = []

    @getComponentByUrl: (url) ->
        appPath = "/#{ExtConfig.appPath}"
        (return c if (url.indexOf("#{appPath}/#{c.type}/#{c.name}.js") >= 0) for c in components)
        throw new Error('File not found')

class ExtComponent

    constructor: () ->
        @name = ""
        @type = '' # model, store, controller or view
        @component = { }

        @autoDefine = true
        @autoCreate = false

        ExtComponentManager.register(@)

    render: () ->   ExtJsFormatter.c(@)

    emit: () ->
        r = {
            name: @name,
            type: @type,
            autoDefine: @autoDefine,
            autoCreate: @autoCreate,
            component: @component
        }
        return r

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}