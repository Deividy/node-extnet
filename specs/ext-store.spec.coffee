{ schema, values } = require('./values.coffee')
ExtStore = require('../src/components/ext-store')

debug = false

assert = (extStore, expected) ->
    ret = extStore.emit()
    if (debug)
        console.log("--- Return ---")
        console.log(ret)
        console.log("---")
        console.log("--- Expected ---")
        console.log(expected)
        console.log("---")

    ret.should.eql(expected)

describe("ExtStore emits a Ext.data.Store", () ->
    it('should emit a simple Ext.data.Store with a schema and values', () ->
        extStore = new ExtStore(values)
        extStore.model('users')
        #assert(extStore, e)
    )
)
