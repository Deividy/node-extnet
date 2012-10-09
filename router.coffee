ExtGrid = require("./src/components/ext-grid")
ExtModel = require("./src/components/ext-model")
ExtStore = require("./src/components/ext-grid")

module.exports = (app) ->
    grid = new ExtGrid(schema)
    app.get('/', (req, res) ->
        grid.model(new ExtModel(schema.columns))
        grid.store(new ExtStore(values))
        res.send(grid.emit())
    )
