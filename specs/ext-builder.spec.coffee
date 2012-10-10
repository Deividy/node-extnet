{ schema, values } = require('./values.coffee')
{ ExtComponentManager, ExtComponent } = require('../src/ext-component')
ExtBuilder = require('../src/ext-builder')
ExtFormatter = require('../src/ext-formatter')

describe('Tests with ExtBuilder', () ->
    it('should emit the requires', () ->
        e = new ExtComponent()
        e.require("Ext.data.*")

        b = new ExtBuilder()
        eqls = "Ext.require([ 'Ext.data.*' ])"
        b.emitRequires(ExtFormatter).should.equal(eqls)
    )
)
