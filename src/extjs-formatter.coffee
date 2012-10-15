_ = require('underscore')

class ExtJsFormatter
    @c: (c) ->
        opt = c.options
        cpt = c.component
        if (opt.define)
            str = "Ext.define('#{opt.name}', "
            str += cpt
            str += ")"

        else if (opt.create)
            return "Ext.create('#{opt.name}', #{ctp});"

        if (opt.create)
            str += "Ext.create('#{opt.name}');"

        return str

module.exports = ExtJsFormatter