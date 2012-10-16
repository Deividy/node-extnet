_ = require('underscore')
ExtJsFormatter = require('./extjs-formatter')
ExtConfig = require('./ext-config')

class ExtComponentManager
    components = []

    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @components: () -> components

    @clean: () ->
        components = []

    # MAY: Be refactored, not to much consistent
    @getComponentByUrl: (url) ->
        us = url.split('?')[0].split('/')
        appPath = us[1]
        throw new Error('File not found') if (appPath != ExtConfig.appPath)

        type = us[2]
        name = us[3].split('.')[0]

        for c in components
            return c if (c.type == type && c.name == name)

        throw new Error('File not found')

class ExtComponent

    constructor: () ->
        @name = ""
        @type = ''
        @requires = [ ]
        @autoDefine = true
        @autoCreate = false
        @component = { }
        @isRendered = false

        ExtComponentManager.register(@)

    build: () ->
        c = {
            name: @name,
            type: @type,
            requires: @requires,
            autoDefine: @autoDefine,
            autoCreate: @autoCreate,
            component: @component
        }
        return c

    render: () ->
        @isRendered = true
        return ExtJsFormatter.c(@)

    emit: () ->
        r = @build()
        return r

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}