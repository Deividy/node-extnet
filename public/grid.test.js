Ext.define('GridTest', {
    extend: 'Ext.grid.Panel',
    store: Ext.create('UserStore'),
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
    ],
    width: 650,
    height:150,
    renderTo: 'grid-test'
});