{ ExtComponent } = require('../ext-component')

class ExtViewport extends ExtComponent
    constructor: (@name) ->
        c = {
            extend: 'Ext.container.Viewport'
            layout: 'border',
            items: [
                {
                    region: 'north',
                    html: 'North!'
                },
                {
                    region: 'west',
                    html: 'West!'
                },
                {
                    region: 'south',
                    html: 'South!'
                },
                {
                    region: 'east',
                    html: 'East!'
                },
                {
                    region: 'center',
                    html: 'Center!'
                },
            ]
        }
        super(@name, c)

module.exports = ExtViewport