jade = require('jade')
ExtModel = require('./src/components/ext-model')
{ schema, values } = require('./specs/values.coffee')

module.exports = (app) ->
    app.get('/', (req, res) ->
        requires = ["'Ext.grid.*'", "'Ext.data.*'"]
        components = [new ExtModel(schema).emit()]

        res.render('layout', {
            requires: requires,
            components: components
        })
    )
