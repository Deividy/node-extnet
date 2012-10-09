class ExtFormat

    @f: (n) ->
        return "'#{n}'"

    @field: (f) ->
        throw new Error("Invalid field #{c.toString()}") if (!f.name?)
        field = "{ "
        field += "name: #{ExtFormat.f(f.name)}"
        field += ", type: #{ExtFormat.f(f.type)}" if (f.type?)
        field += ", defaultValue: #{ExtFormat.f(f.default)}" if (f.default?)
        field += " }"
        return field

    @value: (v) ->
        return v

    @type: (t) ->
        return t

module.exports = ExtFormat