{ schema, values, model } = require('./values.coffee')
ExtModel = require('../src/components/ext-model')

extModel = new ExtModel(schema)

describe('Basics tests with ext-model', () ->
    it('should emit a simple model config', () ->
        extModel.emit().should.be.eql(model)
    )
)