jade = require('jade')
ExtModel = require('./src/components/ext-model')
ExtViewport = require('./src/components/ext-viewport')
{ schema, values } = require('./specs/values.coffee')
{ ExtComponentManager, ExtComponent } = require('./src/ext-component')

module.exports = (app) ->
    app.get('/', (req, res) ->
        ExtComponentManager.clean()

        viewport = new ExtViewport('viewport')
        model = new ExtModel(schema)


        requires = []
        (requires.push(i.emit()) for i in ExtComponentManager.requires())

        res.render('layout', {
            viewport: schema.name,
            requires: requires.join(', '),
            components: ExtComponentManager.components()
        })
    )