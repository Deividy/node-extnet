{ ExtBuilder, ExtComponent, addComponent } = require('./ext-builder')

class ExtGrid extends ExtBuilder

    build: () ->
        super()
        columns = @schema.columns
        for c in columns
            console.log(c)

    emit: (req, res) ->
        @build()
        res.send(@content)

module.exports = ExtGrid
