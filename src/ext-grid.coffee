ExtBuilder = require('./ext-builder')

class ExtGrid extends ExtBuilder
    emit: () ->
        return @schema

module.exports = ExtGrid