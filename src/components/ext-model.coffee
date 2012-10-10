{ ExtComponent } = require('../ext-component')


class ExtModel extends ExtComponent

    constructor: (@data) ->
        super(@data)
        @require('Ext.data.*')

        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

    emitFields: (f) ->
        fields = []
        for c in @fields
            fields.push(f.field(c))

        return fields.join(', ')

    emit: (f) ->
        super()
        return f.emitModel(@)

module.exports = ExtModel