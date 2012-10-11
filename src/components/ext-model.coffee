{ ExtComponent } = require('../ext-component')


class ExtModel extends ExtComponent

    constructor: (@data) ->
        super(@data)
        @require('Ext.data.*')

        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

    use: () -> return "oi"

    emitFields: () ->
        fields = []
        (fields.push({ name: c.name }) for c in @fields)
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