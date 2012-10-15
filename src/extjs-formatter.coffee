ExtConfig = require('./ext-config')
_ = require('underscore')

class ExtJsFormatter
    _name = (type, name) -> "#{ExtConfig.ns}.#{type}.#{name}"

    @c: (c) ->
        if (c.autoDefine)
            str = "Ext.define('#{_name(c.type, c.name)}', "
            str += c.component
            str += ")"
        else if (c.autoCreate)
            return "Ext.create('#{_name(c.type, c.name)}', #{c.component});"

        if (c.autoCreate)
            str = "Ext.create('#{_name(c.type, c.name)}');"

        return str

module.exports = ExtJsFormatter