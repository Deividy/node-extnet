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

class ExtComponent
    constructor: (@data) ->
        @isEmited = false
        ExtComponentManager.register(@)

    require: (c) ->
        ExtComponentManager.require(c)
        return @

    emit: () ->
        @isEmited = true


class ExtRequire extends ExtComponent
    constructor: (@component) ->

    emit: () ->
        return "'#{@component}'"


module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}