{ ExtComponent } = require('../ext-component')

class ExtModel extends ExtComponent

    emitFields: () ->
        fields = []
        for c in @data.columns
            o = "{ name: '#{c.name}', type: '#{c.type}', defaultValue: '#{c.default}' }"
            fields.push(o)

        return fields.join(',')

    emit: () ->
        return "Ext.define('#{@data.name}', {
                extend: 'Ext.data.Model',
                fields: [
                    #{@emitFields()}
                ]
            });"

module.exports = ExtModel