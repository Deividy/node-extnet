path = require('path')
express = require('express')
repoDir = path.join(__dirname, '..')

app = express()

class Bootstrap
    app: app

    constructor: (@env, @port) ->

    initConfig: () ->
        self = @
        app.configure () ->
            app.use(app.router)
            app.use(express.bodyParser())

    initRouter: () ->
        require('./router')(app)

    run: () ->
        @initConfig()
        @initRouter()

        app.listen(@port)

        console.log("Running on port #{@port}");


module.exports = Bootstrap