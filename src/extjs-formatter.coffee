ExtConfig = require('./ext-config')
_ = require('underscore')

class ExtJsFormatter
    _cptName = (type, name) -> "#{ExtConfig.ns}.#{type}.#{name}"

    @c: (c) ->
        cptName = _cptName(c.type, c.name)
        if (c.autoDefine)
            str = "Ext.define('#{cptName}', #{JSON.stringify(c.component)});"
            str = "Ext.create('#{cptName}');" if (c.autoCreate)
        else if (c.autoCreate)
            return "Ext.create('#{cptName}', #{JSON.stringify(c.component)});"

        return str

module.exports = ExtJsFormatter