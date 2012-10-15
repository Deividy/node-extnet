_ = require('underscore')
ExtJsFormatter = require('./extjs-formatter')

class ExtComponentManager
    components = []

    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @components: () -> components

    @clean: () ->
        components = []

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
        r = @build()
        return ExtJsFormatter.c(@)

    emit: () ->
        r = @build()
        return r

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}