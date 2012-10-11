_ = require('underscore')

class ExtComponentManager
    components = []
    requires = []

    # Setters
    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @require: (c) ->
        requires.push(new ExtRequire(c))
        return ExtComponentManager

    # Getters
    @components: () -> components

    @requires: () -> requires

    @clean: () ->
        requires = []
        components = []

class ExtComponent
    constructor: (@name, @component) ->
        @isEmited = false
        ExtComponentManager.register(@)

    require: (c) ->
        ExtComponentManager.require(c)
        return @

    emit: () ->
        @isEmited = true
        ret = {
            name: @name,
            component: @component
        }
        return ret

class ExtRequire
    constructor: (@component) ->

    emit: () ->
        return "'#{@component}'"


module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
    ExtRequire: ExtRequire
}