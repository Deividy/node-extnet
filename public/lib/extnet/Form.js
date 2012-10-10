Ext.namespace('xn.components');

Ext.form.Action.StoreSubmit = Ext.extend(Ext.form.Action.Submit, {
	type: 'StoreSubmit',
	run: function () {
		var o = this.options;
		if (o.clientValidation === false || this.form.isValid()) {
			this.setupStoreEvents(true);
			var values = this.form.getFieldValues(true);
			if (this.form.cursor == -1) {
				this.form.record = null;
			}
			if (!this.form.record) {
				this.form.record = this.form.addRecord(values);
			} else {
				this.form.updateRecord(this.form.record);
			}
		} else if (o.clientValidation !== false) {
			this.raiseClientFailure();
		}
	},

	raiseClientFailure: function () {
		this.failureType = Ext.form.Action.CLIENT_INVALID;
		this.form.afterAction(this, false);
	},

	storeWriteHandler: function (store, action, result, res, rs) {
		this.setupStoreEvents(false);
		this.form.afterAction(this, true);
	},

	storeExceptionHandler: function (misc) {
		this.setupStoreEvents(false);
		this.form.afterAction(this, false);
	},

	setupStoreEvents: function (enable) {
		var fn = (enable) ? this.form.store.on : this.form.store.un;
		fn.call(this.form.store, 'write', this.storeWriteHandler, this);
		fn.call(this.form.store, 'exception', this.storeExceptionHandler, this);
	}
});

Ext.form.Action.ACTION_TYPES.StoreSubmit = Ext.form.Action.StoreSubmit;

xn.components.StoreForm = Ext.extend(Ext.form.BasicForm, {
	constructor: function (el, config) {
		xn.components.StoreForm.superclass.constructor.call(this, el, config);
		this.addEvents(
			'beforeload',
			'load'
		);
		this.bindStore(config.store, true);
	},

	submit: function (options) {
		this.doAction('StoreSubmit', options);
		return this;
	},

	addRecord: function (values) {
		var store = this.store;
		if (store.recordType) {
			var rec = new store.recordType({ newRecord: true });
			rec.fields.each(function (f) {
				rec.data[f.name] = values[f.name] || f.defaultValue || null;
			});
			rec.commit();
			store.add(rec);
			this.record = rec;
			return rec;
		}
		return false;
	},

	createRecord: function () {
		var store = this.store;
		if (store.recordType) {
			var rec = new store.recordType({ newRecord: true });
			rec.fields.each(function (f) {
				rec.data[f.name] = f.defaultValue || null;
			});
			this.record = rec;
			this.cursor = -1;
			return this.loadRecord(rec);
		}
		return false;
	},

	doLoad: function (recNum) {
		var record = this.store.getAt(recNum);
		if (!record || !this.fireEvent('beforeload', this, recNum, record)) {
			return false;
		}
		this.cursor = recNum;
		this.record = record;
		var res = this.loadRecord(record);
		this.fireEvent('load', this, res);
		return res;
	},

	bindStore: function (store, initial) {
		var doLoad;
		if (!initial && this.store) {
			if (store !== this.store && this.store.autoDestroy) {
				this.store.destroy();
			}

			if (!store) {
				this.store = null;
			}
		}
		if (store) {
			store = Ext.StoreMgr.lookup(store);
			doLoad = true;
		}
		this.store = store;
		if (doLoad) {
			this.onLoad(0);
		}
	},

	unbind: function (store) {
		this.bindStore(null);
	},

	onLoad: function (o) {
		if (!this.rendered) {
			return;
		}

		this.cursor = (o && o.recordIndex) ? o.recordIndex : 0;
		this.doLoad(this.cursor);
	},

	getLastIndex: function () {
		return this.getTotalCount() - 1;
	},

	getNextIndex: function () {
		var index = this.cursor + 1;
		return (index < this.getTotalCount()) ? index : this.cursor;
	},

	getPreviousIndex: function () {
		var index = this.cursor - 1;
		return (index > 0) ? index : 0;
	},

	getTotalCount: function () {
		return this.store.getTotalCount();
	},

	store: null,

	record: null,

	cursor: -1
});


xn.components.FormPanel = Ext.extend(Ext.FormPanel, {
	initComponent: function () {
		xn.components.FormPanel.superclass.initComponent.call(this);
		this.addEvents(
			'beforeload',
			'load',
			'beforesubmit',
			'submit',
			'beforereset',
			'reset',
			'beforemove',
			'move',
			'success',
			'failure'
		);
		this.relayEvents(this.getForm(), ['beforeload', 'load']);
	},

	createForm: function () {
		var config = this.initialConfig;
		return new xn.components.StoreForm(null, config);
	},

	submit: function (options) {
		options = options || {};
		formPanel = this;

		var opts = Ext.applyIf(options, {
			success: formPanel.onSuccess,
			failure: formPanel.onFailure,
			scope: formPanel
		});

		var bform = this.getForm();

		if (!this.fireEvent('beforesubmit', formPanel, opts)) {
			return false;
		}

		var res = bform.submit(opts);

		this.fireEvent('submit', formPanel);

		return res;
	},

	reset: function () {
		if (!this.fireEvent('beforereset', this)) {
			return false;
		}
		this.getForm().reset();
		this.fireEvent('reset', this);
		return true;
	},


	moveFirst: function () {
		this.doMove(0);
	},

	hasPrevious: function () {
		var cursor = this.getForm().cursor;
		return (cursor >= 0 && cursor - 1 >= 0);
	},

	movePrevious: function () {
		this.doMove(this.form.getPreviousIndex());
	},

	hasNext: function () {
		var cursor = this.getForm();
		total = this.getForm().getTotalCount();
		return (cursor >= 0 && cursor < total - 1);
	},

	moveNext: function () {
		this.doMove(this.getForm().getNextIndex());
	},

	moveLast: function () {
		this.doMove(this.getForm().getLastIndex());
	},

	doMove: function (recNum) {
		if (!this.fireEvent('beforemove', this, this.cursor, recNum)) {
			return;
		}
		this.getForm().doLoad(recNum);
		this.fireEvent('move', this, recNum);
	},

	addNew: function () {
		return this.getForm().createRecord();
	},

	isDirty: function () {
		var bform = this.getForm();
		var dirty = false;
		bform.items.each(function (f) {
			if (f.isDirty()) {
				dirty = true;
			}
		});
		return dirty;
	},
	onFailure: function (f, action) {
		this.fireEvent('failure', f, action);
	},

	onSuccess: function (f, action) {
		this.fireEvent('success', f, action);
	},

	activeIndex: function () {
		return this.getForm().cursor;
	},

	createRecord: function () {
		return this.getForm().createRecord();
	},

	getRecord: function () {
		return this.getForm().record;
	}

});