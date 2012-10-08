ExtGrid = require("./ext-grid")

schema = {
    name: 'users',
    fk: [],
    uniques: [ { name: 'users_id', type: "PRIMARY_KEY", columns: [ 'users_id' ] } ],
    columns: [
        {
            name: 'users_id',
            index: 1,
            default: 'NULL',
            isNull: 'NO'
            type: 'int'
            maxLength: 'NULL'
            octLength: 'NULL'

        },
        {
            name: 'login',
            index: 2,
            default: 'NULL',
            isNull: 'NO'
            type: 'varchar'
            maxLength: 50
            octLength: 50
        },
        {
            name: 'pass',
            index: 3,
            default: 'NULL',
            isNull: 'NO'
            type: 'varchar'
            maxLength: 150
            octLength: 150
        }
    ]
}

module.exports = (app) ->
    grid = new ExtGrid(schema)
    app.get('/', (req, res) ->
        res.send(grid.emit())
    )