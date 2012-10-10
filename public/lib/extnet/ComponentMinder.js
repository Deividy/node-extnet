
xn.ComponentMinder = Ext.extend(Object, {
	constructor: function (base) {
		this.base = (base || Ext.id(null, 'minder'));
		this.ids = [];
		this.hasResolved = false;
	},

	getId: function (id) {
		this.ids.push(id);
		return this.base + '-' + id;
	},

	resolveIds: function () {
		this.hasResolved = true;

		this.ids.each(function (id) {
			this[id] = Ext.ComponentMgr.get(this.base + '-' + id);
		}, this);
	},

	resolveOnce: function () {
		if (this.hasResolved) {
			return false;
		}

		this.resolveIds();
		return true;
	}
});


