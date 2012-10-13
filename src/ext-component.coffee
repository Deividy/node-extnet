_ = require('underscore')

class ExtComponentManager
    components = []
    requires = []

    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @require: (c) ->
        requires.push(new ExtRequire(c))
        return ExtComponentManager

    @components: () -> components

    @requires: () -> requires

    @clean: () ->
        requires = []
        components = []

class ExtComponent
    constructor: (@options, @component) ->
        @isEmited = false
        ExtComponentManager.register(@)

    require: (c) ->
        ExtComponentManager.require(c)
        return @

    emit: () ->
        @isEmited = true
        return  { options:@options, component: @component }

class ExtRequire
    constructor: (@component) ->

    emit: () ->
        return "'#{@component}'"


module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
    ExtRequire: ExtRequire
}