{ ExtComponent } = require('../ext-component')
ExtJsFormatter = require('../extjs-formatter')

class ExtModel extends ExtComponent

    constructor: (@schema) ->
        @fields = if (@schema.columns) then @schema.columns else []
        @name = if (@schema.name) then @schema.name else ""

        o = {
            name: @name,
            requires: ['Ext.data.*'],
            define: true,
            create: false
        }
        c = {
            extend: 'Ext.data.Model',
            fields: @fields(@schema.columns)
        }
        super(o, c)

    fields: (fields) ->
        ret = []
        for c of fields
            ret.push({ name: c.name })

        return ret.join(',')

module.exports = ExtModel