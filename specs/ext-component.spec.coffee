{ schema, values, model } = require('./values.coffee')
{ ExtComponentManager, ExtComponent } = require('../src/ext-component')


cpt = new ExtComponent(model.options, model.component)

describe('Basics tests with ext-component', () ->
    it('return a simple component config', () ->
        cpt.emit().should.be.eql(model)
    )
    it('emit a formatted component ready to render', () ->
        ret = "Ext.define('Dl.#{model.options.type}.#{model.options.name}', #{model.component})"
        cpt.render().should.be.eql(ret)
    )
    describe('Basic tests with ExtComponentManager', () ->
        it('should return true', () ->
            ExtComponentManager.components().should.be.not.empty;
        )
        it('should clean ExtComponentManager', () ->
            ExtComponentManager.clean();
            ExtComponentManager.components().should.be.empty;
        )
        it('should register a component into ExtComponentManager', () ->
            e = new ExtComponent();
            ExtComponentManager.components().length.should.eql(1)
        )
        it('should be an instanceof ExtComponent', () ->
            ExtComponentManager.components()[0].should.be.an.instanceof(ExtComponent)
        )
    )
)