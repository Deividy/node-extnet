{ ExtComponent } = require('../ext-component')


class ExtModel extends ExtComponent

    constructor: (@data) ->
        @require('Ext.data.*')

        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

        c = {
            extend: 'Ext.data.Model',
            fields: @emitFields()
        }
        super("#{@data.name}Model", c)

    emitFields: () ->
        fields = []
        (fields.push({ name: c.name }) for c in @fields)
        return fields

module.exports = ExtModel