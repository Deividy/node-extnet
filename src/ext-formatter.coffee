_ = require('underscore')
ExtConfig = require('./ext-config')

class ExtFormatter

    @f: (n) ->
        return "'#{n}'"

    @field: (f) ->
        throw new Error("Invalid field #{c.toString()}") if (!f.name?)
        field = {}
        field.name = ExtFormatter.f(f.name)
        field.type = ExtFormatter.f(f.type) if (f.type?)
        field.defaultValue = ExtFormatter.f(f.default) if (f.default?)
        return field

    @value: (v) ->
        return v

    @type: (t) ->
        return t

    @emitRequires: (reqs) ->
        throw new Error("Invalid requires #{reqs.toString()}") if (!_.isArray(reqs) )
        r = []
        (r.push(i.emit()) for i in reqs)
        return "Ext.require([ #{r.join(',')} ])"

    @emitModel: (context) ->
        return "Ext.define(#{ExtFormatter.f(context.name)}, {
                extend: 'Ext.data.Model',
                fields: [
                    #{context.emitFields(ExtFormatter)}
                ]
            });"

module.exports = ExtFormatter