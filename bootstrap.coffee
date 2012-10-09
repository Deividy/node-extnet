path = require('path')
express = require('express')
node_static = require('node-static')

publicDir = path.join(__dirname, '', 'public')
file = new(node_static.Server)(publicDir)

app = express()

class Bootstrap
    app: app

    _staticFiles = () ->
        (req, res, next) ->
            return file.serve(req, res) if (req.url.match('.*\\.(jpeg|jpg|png|css|js|gif|favicon|html|xml)'))

    _initRouter = () ->
        require('./router')(app)

    constructor: (@env, @port) ->

    initConfig: () ->
        app.configure(@env, () ->
            app.use(app.router)
            app.use(_staticFiles())
            app.use(express.bodyParser())
        )

    run: () ->
        @initConfig()
        _initRouter()

        app.listen(@port)

        console.log("Running on port #{@port}");

module.exports = Bootstrap
