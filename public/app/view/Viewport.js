Ext.define('Dl.view.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'border',
    items: [
        {
            region: 'center',
            items: [ Ext.create('Dl.view.users.List') ]
        }
    ]

});