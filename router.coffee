{ schema, values } = require('./specs/values.coffee')

module.exports = (app) ->
    app.get('/', (req, res) ->
        res.render('layout', {

        })
    )