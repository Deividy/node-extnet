
xn.DataSource = Ext.extend(Ext.util.Observable, {
	pageSize: 50,

	autoRetry: false,
	maxRetries: 3,
	silentErrors: false,
	usePagingStore: true,


	constructor: function (config) {
		xn.DataSource.superclass.constructor.call(config);
		this.lastRefreshedOn = xn.utcLoadedAt;

		Ext.apply(this, config);

		this.getStore();

		if (this.data) {
			this.loadData(this);
			delete this.data;
		}

		this.addEvents('merge');
	},

	loadData: function (o) {
		this.getStore().loadData(o, false, { start: 0, limit: this.pageSize, sourceTable: this.sourceTable });
	},

	loadRemote: function () {
		var store = this.getStore(),
			o = { params: { start: 0, limit: this.pageSize, sourceTable: this.sourceTable} };
		store.load(o);
	},

	refreshData: function () {
		var params = Ext.applyIf({ modifiedAfter: this.lastRefreshedOn.format('c') }, this.getStore().baseParams),
		    meta = this.getReader().meta,
		    store = this.getStore();

		var o = Ext.apply({
			url: this.refreshUrl || this.url,
			params: params,
			scope: this,
			success: function (response) {
				if (response.status == 204) {
					return;
				}

				var result = Ext.decode(response.responseText);
				this.lastRefreshedOn = result.utcStartedOn;
				if (this.customMerge) {
					this.customMerge(result[meta.root]);
				} else {
					this.merge(result[meta.root], []);
				}
			}
		}, this.refreshOptions || {});

		Ext.Ajax.request(o);
	},

	merge: function (rowsToMerge, rowsOrIdsToDelete) {
		rowsToMerge = xn.Util.ensureArray(rowsToMerge);
		rowsOrIdsToDelete = xn.Util.ensureArray(rowsOrIdsToDelete);

		var idsToDelete = rowsOrIdsToDelete.select(function (o) { return Ext.isObject(o) ? o.id : o; });

		if (0 == rowsToMerge.length && 0 == rowsOrIdsToDelete.length) {
			return;
		}

		var store = this.getStore();
		store.suspendEvents(false);

		var clearedFilter = false;
		if (store.isFiltered()) {
			clearedFilter = true;
			store.clearFilter(true);
		}

		var deletedIds = [];
		for (var i = 0; i < idsToDelete.length; i++) {
			var id = idsToDelete[i];

			if (store.removeById(id)) {
				deletedIds.push(id);
			}
		}

		rowsToMerge = rowsToMerge.where(function (r) { return !deletedIds.contains(r.id) });
		// Here we handle the case where it looked like there was work to be done (eg, we had some ids to delete), but when we
		// looked at the store, we saw that nothing needed to be done (eg, the ids to delete didn't exist anyway). In that case,
		// we bail out early and don't fire events.
		if (deletedIds.length == 0 && rowsToMerge.length == 0) {
			store.resumeEvents();
			return;
		}

		var rowsToAdd = [];
		var mergedRecords = [];

		if (rowsToMerge.length > 0) {
			for (i = 0; i < rowsToMerge.length; i++) {
				var newData = rowsToMerge[i];
				var r = store.getById(newData.id);

				if (r) {
					Ext.apply(r.data, newData);
				} else {
					rowsToAdd.push(newData);
				}
			}

			if (rowsToAdd.length > 0) {
				var data = {};
				var reader = this.getReader();
				data[reader.meta.root] = rowsToAdd;
				data[reader.meta.successProperty] = true;

				var addedRecords = reader.readRecords(data).records;
				store.add(addedRecords);

				mergedRecords = mergedRecords.concat(addedRecords);
			}
		}

		if (clearedFilter && store.lastFilter) {
			store.filterBy(store.lastFilter);
		}

		store.applySort && store.applySort();

		store.resumeEvents();
		store.fireEvent('datachanged', store);
		this.fireEvent('merge', mergedRecords, deletedIds);
	},

	startRefreshingData: function (intervalms, customMerge, refreshUrl) {
		this.stopRefreshingData();
		this.customMerge = customMerge;
		this.refreshUrl = refreshUrl;
		
		this.task = {
			run: this.refreshData,
			interval: intervalms,
			scope: this
		};

		Ext.TaskMgr.start(this.task);
	},

	stopRefreshingData: function () {
		if (!Ext.isObject(this.task)) {
			return;
		}
		Ext.TaskMgr.stop(this.task);
		this.task = null;
	},

	getReader: function () {
		if (this.reader) {
			return this.reader;
		}
		this.reader = new Ext.data.JsonReader({
			idProperty: 'id',
			root: 'data',
			fields: this.fieldsCfg
		});
		return this.reader;
	},

	getWriter: function () {
		if (this.writer) {
			return this.writer;
		}

		this.writer = new Ext.data.JsonWriter({
			encode: true,
			writeAllFields: false
		});
		return this.writer;
	},

	getStore: function () {
		if (this.store) {
			return this.store;
		}

		this.store = this.createStore(null, true);
		return this.store;
	},

	createStore: function (cfg, bindLoadEvent) {
		var overrides = cfg || {};

		var storeOpts = Ext.apply({
			reader: this.getReader(),
			writer: this.getWriter(),
			autoSave: true,
			listeners: {
				exception: xn.handleException
			},
			sourceTable: this.sourceTable,
			baseParams: { sourceTable: this.sourceTable }
		}, overrides);

		var proxy = this.getProxy();

		if (bindLoadEvent && proxy) {
			proxy.on('load', function (proxy, o, options) {
				this.utcLastRefreshedOn = o.reader.jsonData.utcStartedOn;
			});

			storeOpts.proxy = proxy;
		}

		var store;
		if (this.usePagingStore) {
			store = new xn.PagingStore(storeOpts);
			store.pageSize = this.pageSize;
		} else {
			store = new xn.Store(storeOpts);
		}

		return store;
	},

	getProxy: function () {
		if (this.proxy) {
			return this.proxy;
		}

		this.proxy = new Ext.data.HttpProxy({ url: this.url });
		return this.proxy;
	},

	getColumnModel: function () {
		if (Ext.isObject(this.columnModel)) {
			return this.columnModel;
		}

		var defaults = {
			width: 100,
			sortable: true
		};

		if (Ext.isDefined(arguments[0]) && Ext.isObject(arguments[0])) {
			defaults = arguments[0];
		}

		this.columnModel = new Ext.grid.ColumnModel({
			columns: this.columnsCfg,
			defaults: defaults
		});

		return this.columnModel;
	}
});
