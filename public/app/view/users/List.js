Ext.define('Dl.view.users.List', {
    extend: 'Ext.grid.Panel',
    store: Ext.create('Dl.store.User'),
    columns: [
        {
            text: '#',
            flex: 0.1,
            dataIndex: 'id'
        },
        {
            text: 'Name',
            flex: 0.6,
            dataIndex: 'name'
        },
        {
            text: 'Login',
            flex: 0.3,
            dataIndex: 'login'
        }
    ]
});