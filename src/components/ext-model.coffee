{ ExtComponent } = require('../ext-component')


class ExtModel extends ExtComponent

    constructor: (@data) ->
        super(@data)
        @require('Ext.data.*')

        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

    emitFields: () ->
        fields = []
        for c in @fields
            fields.push({ name: c.name })
        return fields

    emit: () ->
        super()
        ret = {
            name: @name,
            extend: 'Ext.data.Model',
            fields: @emitFields()
        }
        return ret

module.exports = ExtModel