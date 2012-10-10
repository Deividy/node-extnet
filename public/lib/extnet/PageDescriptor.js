
xn.PageDescriptor = Ext.extend(Object, {
	constructor: function (config) {
		Ext.apply(this, config);
	},

	isAvailable: function () {
		return true;
	},

	isEnabled: function () {
		return this.isAvailable();
	}
});