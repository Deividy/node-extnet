jade = require('jade')
ExtModel = require('./src/components/ext-model')
{ schema, values } = require('./specs/values.coffee')
{ ExtComponentManager, ExtComponent } = require('./src/ext-component')

module.exports = (app) ->
    app.get('/', (req, res) ->
        ExtComponentManager.clean()
        requires = ""

        model = new ExtModel(schema)
        components = [model.emit()]

        requires += (i.emit() for i in ExtComponentManager.requires())

        res.render('layout', {
            requires: requires,
            components: components
        })
    )
