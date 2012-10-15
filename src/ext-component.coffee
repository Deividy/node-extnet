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
    constructor: (@options, @component) ->
        @isEmited = false
        ExtComponentManager.register(@)

    build: () ->
        return { options: @options, component: @component }

    emit: (f) ->
        @isEmited = true
        r = @build()

        return ExtJsFormatter.c(r) if (f)
        return r

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}