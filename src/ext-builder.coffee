ExtComponent = require('./ext-component')
ExtConfig = require('./ext-config')

class ExtBuilder
    constructor: (@schema) ->
        @content = ""
        @addScript("ext-all")

    build: () ->
        (@addComponent(c) for c in ExtComponent.components())
    
    addComponent: (c) ->

    addScript: (c) ->
        @content += "<script type='text/javascript' "
        @content += "src='#{ExtConfig.getLibPath()}/#{c}.js'></script>"

    emit: () ->

module.exports = {
    ExtBuilder: ExtBuilder
    ExtComponent: ExtComponent
    ExtConfig: ExtConfig

    addComponent: (c) -> ExtComponent.add(c)
    getConfig: () -> ExtConfig
}
