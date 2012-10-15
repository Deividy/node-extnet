ExtConfig = require('./ext-config')
_ = require('underscore')

class ExtJsFormatter
    _name = (type, name) -> "#{ExtConfig.ns}.#{type}.#{name}"

    @c: (c) ->
        opt = c.options
        cpt = c.component
        if (opt.define)
            str = "Ext.define('#{_name(opt.type, opt.name)}', "
            str += cpt
            str += ")"
        else if (opt.create)
            return "Ext.create('#{_name(opt.type, opt.name)}', #{ctp});"

        if (opt.create)
            str += "Ext.create('#{_name(opt.type, opt.name)}');"

        return str

module.exports = ExtJsFormatter