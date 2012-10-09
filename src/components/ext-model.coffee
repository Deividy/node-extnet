{ ExtComponent } = require('../ext-component')

class ExtModel extends ExtComponent

    constructor: (@data) ->
        @fields = if (@data.columns) then @data.columns else []
        @name = if (@data.name) then @data.name else ""

    emitFields: () ->
        fields = []
        for c in @fields
            o = "{ name: '#{@formatField(c.name)}', "
            o += "type: '#{@formatField(c.type)}', "
            o += "defaultValue: '#{@formatField(c.default)}' }"
            fields.push(o)

        return fields.join(',')

    emit: () ->
        return "Ext.define('#{@formatName(@name)}', {
                extend: 'Ext.data.Model',
                fields: [
                    #{@emitFields()}
                ]
            });"

module.exports = ExtModel