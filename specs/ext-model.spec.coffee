{ schema, values } = require('./values.coffee')
ExtModel = require('../src/components/ext-model')

assert = (extModel, expected) ->
    ret = extModel.emit()
    ###
    console.log("--- Return ---")
    console.log(ret)
    console.log("---")
    console.log("--- Expected ---")
    console.log(expected)
    console.log("---")
    ###
    ret.should.eql(expected)

describe("ExtModel emits a Ext.data.Model", () ->
    it('should emit a simple Ext.data.Model with a schema', () ->
        extModel = new ExtModel(schema)
        fields = "{ name: 'id', type: 'int', defaultValue: 'NULL' },"
        fields += "{ name: 'login', type: 'varchar', defaultValue: 'NULL' },"
        fields += "{ name: 'pass', type: 'varchar', defaultValue: 'NULL' }"
        e = "Ext.define('users', {
                extend: 'Ext.data.Model',
                fields: [
                    #{fields}
                ]
            });"
        assert(extModel, e)
    )
)