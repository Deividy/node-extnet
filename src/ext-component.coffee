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
        @isRendered = false
        ExtComponentManager.register(@)

    build: () ->
        return { options: @options, component: @component }

    render: () ->
        @isRendered = true
        r = @build()
        return ExtJsFormatter.c(r)

    emit: () ->
        r = @build()
        return r

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}