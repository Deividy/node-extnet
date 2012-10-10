_ = require('underscore')

class ExtRequire
    constructor: (@component) ->

    emit: () ->
        return "'#{@component}'"

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

class ExtComponent
    constructor: (@data) ->
        @isEmited = false
        ExtComponentManager.register(@)

    require: (c) ->
        ExtComponentManager.require(c)
        return @

    emit: () ->
        @isEmited = true

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}