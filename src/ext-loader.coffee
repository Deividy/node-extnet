{ schema, values, model } = require('../specs/values.coffee')
ExtModel = require('./components/ext-model')

extModel = new ExtModel(schema)

class ExtLoader
    constructor: (req, res) ->
        res.send(extModel.render())

    emit: () ->


module.exports = ExtLoader