jade = require('jade')
ExtModel = require('./src/components/ext-model')
{ schema, values } = require('./specs/values.coffee')
{ ExtComponentManager, ExtComponent } = require('./src/ext-component')

module.exports = (app) ->
    app.get('/', (req, res) ->
        ExtComponentManager.clean()

        model = new ExtModel(schema)
        requires = []
        (requires.push(i.emit()) for i in ExtComponentManager.requires())

        res.render('layout', {
            requires: requires.join(', '),
            components: ExtComponentManager.components()
        })
    )