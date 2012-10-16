{ ExtComponent } = require('../ext-component')
ExtJsFormatter = require('../extjs-formatter')

class ExtModel extends ExtComponent

    constructor: (@schema) ->
        super()
        @type = 'model'

        @name = if (@schema.name) then @schema.name else ""
        @component = {
            extend: 'Ext.data.Model',
            fields: @fields(@schema.columns)
        }

    fields: (f) ->
        ret = []
        for c in f
            ret.push({ name: c.name })

        return ret


module.exports = ExtModel