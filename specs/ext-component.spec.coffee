{ ExtComponentManager, ExtComponent } = require('../src/ext-component')

cpt = new ExtComponent()
r = {
    name: '',
    type: '',
    requires: [],
    autoDefine: true,
    autoCreate: false
    component: { }
}
describe('Basics tests with ext-component', () ->
    it('return a simple empty component config', () ->
        cpt.emit().should.be.eql(r)
    )
    it('emit a formatted component ready to render', () ->
        ret = "Ext.define('Dl.#{r.type}.#{r.name}', #{r.component})"
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