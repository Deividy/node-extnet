Ext.define('Dl.store.User', {
    extend: 'Ext.data.JsonStore',
    model: 'Dl.model.User',
    data: [
        {
            id: 1,
            name: 'Test',
            login: 'test'
        },
        {
            id: 2,
            name: 'TestIt',
            login: 'testit'
        }
    ]
});