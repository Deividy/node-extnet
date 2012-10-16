{ schema, values, model } = require('./specs/values.coffee')
ExtModel = require('./src/components/ext-model')

module.exports = (app) ->
    app.get('/', (req, res) ->
        extModel = new ExtModel(schema)
        res.render('layout')
    )