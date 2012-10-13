{ ExtComponent } = require('../ext-component')


class ExtModel extends ExtComponent

    constructor: (@schema) ->
        @require('Ext.data.*')

        @fields = if (@schema.columns) then @schema.columns else []
        @name = if (@schema.name) then @schema.name else ""


module.exports = ExtModel