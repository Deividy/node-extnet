ExtConfig = require('./ext-config')
_ = require('underscore')

class ExtJsFormatter
    _cptName = (type, name) -> "#{ExtConfig.ns}.#{type}.#{name}"

    @c: (c) ->
        cptName = _cptName(c.type, c.name)
        if (c.autoDefine)
            str = "Ext.define('#!{cptName}', #{JSON.stringify(c.component)});"
        else if (c.autoCreate)
            return "Ext.create('!{cptName}', #{JSON.stringify(c.component)});"

        if (c.autoCreate)
            str = "Ext.create('!{cptName}');"

        return str

module.exports = ExtJsFormatter