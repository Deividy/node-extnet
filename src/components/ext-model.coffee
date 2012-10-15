{ ExtComponent } = require('../ext-component')
ExtJsFormatter = require('../extjs-formatter')

class ExtModel extends ExtComponent

    constructor: (@schema) ->
        @name = if (@schema.name) then @schema.name else ""
        o = {
            name: @name,
            type: 'model',
            requires: ['Ext.data.*'],
            define: true,
            create: false
        }
        c = {
            extend: 'Ext.data.Model',
            fields: @fields(@schema.columns)
        }

        super(o, c)

    fields: (f) ->
        ret = []
        for c in f
            ret.push({ name: c.name })

        return ret

module.exports = ExtModel