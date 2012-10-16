{ ExtComponentManager } = require('./ext-component')

class ExtLoader
    constructor: (req, res) ->
        res.send(ExtComponentManager.components()[0].render())

    emit: () ->


module.exports = ExtLoader