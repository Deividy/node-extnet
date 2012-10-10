Ext.define('UserStore', {
    extend: 'Ext.data.JsonStore',
    model: 'UserModel',
    data: [
        {
            id: 1,
            name: 'TestingIt',
            login: 'testing'
        },
        {
            id: 2,
            name: 'TestMan',
            login: 'testman'
        }
    ]
});