
xn.SelectBox = Ext.extend(Ext.DataView, {

    multiSelect: true,

    singleSelect: false,

    simpleSelect: true,

    overClass: 'x-selectbox-item-over',

    selectedClass: 'x-selectbox-item-selected',

    itemSelector: 'li.x-selectbox-item',

    trackOver: true,

    mode: 'check', // or 'radio'

    disabled: false,

    autoEl: {},

    tpl: [
		'<ul class="x-selectbox-options x-selectbox-options-{0}">',
		'	<tpl for=".">',
		'	<li class="x-selectbox-item">{1}</li>',
		'	</tpl>',
		'</ul>'],

    valueField: 'value',

    constructor: function () {
        this.autoEl = Ext.apply({
            tag: 'div',
            cls: 'x-selectbox'
        }, {
            html: [
				'<div class="x-selectbox-head">',
				'	<div class="x-selectbox-head-inner"></div>',
				'</div>',
				'<div class="x-selectbox-options-wrap"></div>',
				'<div class="x-selectbox-foot">',
				'	<div class="x-selectbox-foot-inner"></div>',
				'</div>'].join("\n")
        });
        xn.SelectBox.superclass.constructor.apply(this, arguments);
    },

    initComponent: function () {
        this.tpl = this.getTemplate();
        xn.SelectBox.superclass.initComponent.call(this);
    },

    onRender: function () {
        xn.SelectBox.superclass.onRender.apply(this, arguments);
        this.elements = {
            header: this.el.down('div.x-selectbox-head'),
            wrap: this.el.down('div.x-selectbox-options-wrap'),
            footer: this.el.down('div.x-selectbox-foot')
        };
        this.el.unselectable();
    },

    afterRender: function () {
        xn.SelectBox.superclass.afterRender.apply(this, arguments);
        this.resizeInnerElements();
    },

    onResize: function () {
        xn.SelectBox.superclass.onResize.apply(this, arguments);
        this.resizeInnerElements();
    },

    getTemplateTarget: function () {
        if (!this.rendered) {
            return null;
        }
        return this.elements.wrap;
    },

    getTemplate: function () {
        if (Ext.isString(this.tpl) || Ext.isArray(this.tpl)) {
            var tmplstr = (Ext.isArray(this.tpl)) ? this.tpl.join("\n") : this.tpl;
            tmplstr = String.format(tmplstr, this.mode, '{' + this.valueField + '}');
            this.tpl = new Ext.XTemplate(tmplstr);
        }
        return this.tpl;
    },

    resizeInnerElements: function () {
        var els = this.elements,
		w = this.el.getWidth(true),
		h = this.el.getHeight(true) - els.header.getHeight(true) - els.footer.getHeight(true);
        els.wrap.setSize(w, h, false);
    },

    onClick: function () {
        if (this.disabled) {
            return false;
        }
        return xn.SelectBox.superclass.onClick.apply(this, arguments);
    },

    onMouseOver: function () {
        if (this.disabled) {
            return false;
        }
        return xn.SelectBox.superclass.onMouseOver.apply(this, arguments);   
    },

    onMouseOut: function () {
        if (this.disabled) {
            return false;
        }
        return xn.SelectBox.superclass.onMouseOut.apply(this, arguments);   
    }
});

Ext.reg('selectbox', xn.SelectBox);