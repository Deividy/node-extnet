class ExtConfig
    @ns = "Xn"
    @path = "lib"
    @version = "4.1.1a"
    @debug = false
    @includeAll = true

    @getLibPath: () -> "#{ExtConfig.path}/ext-#{ExtConfig.version}"

module.exports = ExtConfig