class ExtComponent
    components = []

    @add: (c) ->
        components.push(c)
        return ExtComponent

    @remove: (c) ->

    @components: () -> components

    constructor: (@component) ->
        return @

    render: () ->
    
    
module.exports = ExtComponent
