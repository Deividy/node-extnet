class ExtConfig
    @path = "lib"
    @version = "ext-4.1.1a"
    @debug = false
    @includeAll = true
    @getLibPath: () -> "#{ExtConfig.path}/#{ExtConfig.version}"

module.exports = ExtConfig