path = require('path')
_ = require('underscore')
express = require('express')
node_static = require('node-static')

publicDir = path.join(__dirname, '', 'public')
file = new(node_static.Server)(publicDir)

app = express()

class Bootstrap
    app: app

    _staticFiles = () ->
        (req, res, next) ->
            if (req.url.match('.*\\.(jpeg|jpg|png|css|js|gif|favicon|html|xml)'))
                return file.serve(req, res)

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

    initHelpers: () ->
        app.locals.toString = (o) ->
            ret = o
            if (_.isArray(o))
                ret = "["
                ret += (app.locals.toString(i) for i in o)
                ret += "]"
            else if(_.isObject(o))
                ret = "{"
                ret += (app.locals.toString(" #{k}:'#{i}' ") for k, i of o)
                ret += "}"

            return ret

    run: () ->
        @initConfig()
        @initHelpers()
        _initRouter()

        app.listen(@port)

        console.log("Running on port #{@port}");

module.exports = Bootstrap
