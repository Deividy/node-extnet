class ExtComponentManager
    components = []

    @components: () -> components

    @add: (c) ->
        components.push(c)

    @remove: (c) ->

class ExtComponent
    constructor: (@data) ->
        return @

    requires: () ->

    emit: () ->

    register: () ->
        ExtComponentManager.register(@)

module.exports = {
    ExtComponent: ExtComponent
    ExtComponentManager: ExtComponentManager
}