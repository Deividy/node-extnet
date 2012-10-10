{ schema, values } = require('./values.coffee')
{ ExtComponentManager, ExtComponent } = require('../src/ext-component')
ExtFormatter = require('../src/ext-formatter')

ExtModel = require('../src/components/ext-model')
debug = false

assertEmit = (ext, expected) ->
    ret = ext.emit(ExtFormatter)
    if (debug)
        console.log("--- Return ---")
        console.log(ret)
        console.log("---")
        console.log("--- Expected ---")
        console.log(expected)
        console.log("---")

    ret.should.equal(expected)

describe("Tests with ExtModel", () ->
    it('should emit a simple Ext.data.Model with a table schema', () ->
        extModel = new ExtModel(schema)

        fields = "{ name: 'id', type: 'int', defaultValue: 'NULL' }, "
        fields += "{ name: 'login', type: 'varchar', defaultValue: 'NULL' }, "
        fields += "{ name: 'pass', type: 'varchar', defaultValue: 'NULL' }"

        e = "Ext.define('users', {
                extend: 'Ext.data.Model',
                fields: [
                    #{fields}
                ]
            });"
        assertEmit(extModel, e)
    )

    describe("Instance tests", () ->
        it("should be an instance of ExtComponent", () ->
            ExtComponentManager.components()[0].should.be.an.instanceOf(ExtComponent)
        )
        it("should be an instance of ExtModel", () ->
            ExtComponentManager.components()[0].should.be.an.instanceOf(ExtModel)
        )
    )

)