_ = require('underscore')

class ExtComponentManager
    components = []
    requires = []

    # Setters
    @register: (c) ->
        components.push(c)
        return ExtComponentManager

    @require: (c) ->
        requires.push(c)
        return ExtComponentManager

    # Getters
    @components: () ->
        return components

    @requires: () ->
        return requires

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