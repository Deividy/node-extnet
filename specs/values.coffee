schema = {
    name: 'users',
    fk: [],
    uniques: [ { name: 'users_id', type: "PRIMARY_KEY", columns: [ 'users_id' ] } ],
    columns: [
        {
            name: 'id',
            index: 1,
            default: 'NULL',
            isNull: 'NO'
            type: 'int'
            maxLength: 'NULL'
            octLength: 'NULL'

        },
        {
            name: 'login',
            index: 2,
            default: 'NULL',
            isNull: 'NO'
            type: 'varchar'
            maxLength: 50
            octLength: 50
        },
        {
            name: 'pass',
            index: 3,
            default: 'NULL',
            isNull: 'NO'
            type: 'varchar'
            maxLength: 150
            octLength: 150
        }
    ]
}
values = [
    {
        id: 1,
        login: 'test',
        pass: 123
    },
    {
        id: 2,
        login: 'test2',
        pass: 234
    },
]

options = {
    name: 'User',
    type: 'model',
    requires: [ 'Ext.data.*' ],
    define: true,
    create: false
}
component = {
    extend: 'Ext.data.Model',
    fields:[
        {
            name: 'id'
        },
        {
            name: 'name'
        },
        {
            name: 'login'
        }
    ]
}
model = { options: options, component: component }

module.exports = {
    schema: schema
    values: values
    model: model
}