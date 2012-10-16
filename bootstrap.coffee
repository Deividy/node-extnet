path = require('path')
fs = require('fs')
_ = require('underscore')
express = require('express')
node_static = require('node-static')

publicDir = path.join(__dirname, '', 'public')
file = new(node_static.Server)(publicDir)

app = express()

ExtLoader = require('./src/ext-loader')


class Bootstrap
    _staticFiles = () ->
        (req, res, next) ->
            if (req.url.match('.*\\.(jpeg|jpg|png|css|js|gif|favicon|html|xml)'))
                f = "#{publicDir}#{req.url.split('?')[0]}"
                fs.exists(f, (exists) ->
                    return file.serve(req, res) if (exists)
                    return new ExtLoader(req, res)
                )

    _initRouter = () ->
        require('./router')(app)

    constructor: (@env, @port) ->

    initConfig: () ->
        app.configure(@env, () ->
            app.set('views', "#{__dirname}/src/views")
            app.set('view engine', 'jade')
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
