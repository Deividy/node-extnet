{ ExtComponentManager } = require('./ext-component')

class ExtLoader
    constructor: (req, res, next) ->
        c = ExtComponentManager.getComponentByUrl(req.url)
        return res.send(c.render()) if (c)
        next()


module.exports = ExtLoader