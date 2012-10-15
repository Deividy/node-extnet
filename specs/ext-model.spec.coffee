{ schema, values, model } = require('./values.coffee')
ExtModel = require('../src/components/ext-model')

extModel = new ExtModel(schema)

describe('Basics tests with ext-model', () ->
    it('should emit a simple model config', () ->
        extModel.emit().should.be.eql(model)
    )
    it('emit a formatted model ready to render', () ->
        ret = "Ext.define('Dl.#{model.options.type}.#{model.options.name}', #{model.component})"
        extModel.render().should.be.eql(ret)
    )
)