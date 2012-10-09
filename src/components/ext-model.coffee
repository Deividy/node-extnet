{ ExtComponent } = require('../ext-component')
ExtFormat = require('../ext-format')

class ExtModel extends ExtComponent

    constructor: (@data) ->
        super(@data)
        @require('Ext.data.*')

        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

    emitFields: () ->
        fields = []
        for c in @fields
            fields.push(ExtFormat.field(c))
        return fields.join(', ')

    emit: () ->
        super()
        return "Ext.define(#{ExtFormat.f(@name)}, {
                extend: 'Ext.data.Model',
                fields: [
                    #{@emitFields()}
                ]
            });"

module.exports = ExtModel