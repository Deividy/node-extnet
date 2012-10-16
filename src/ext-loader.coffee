{ ExtComponentManager } = require('./ext-component')

class ExtLoader
    constructor: (req, res) ->
        c = ExtComponentManager.getComponentByUrl(req.url)
        return res.send(c.render()) if (c)


module.exports = ExtLoader