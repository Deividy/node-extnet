
xn.DataRefresher = Ext.extend(Ext.util.Observable, {
	constructor: function () {
		this.url = xn.defaultUrl;
		this.stores = {};
		this.refreshTasks = {};
		this.tableWatchers = {};
		this.mappings = [];

		this.addEvents(['crudBroadcast']);

		xn.DataRefresher.superclass.constructor.call(this);

		this.on('crudBroadcast', this.handleCrudBroadcast, this);
	},

	addMapping: function (tableA, tableB, columnMappings, aToBFn, bToAFn) {
		tableA = tableA.toLowerCase();
		tableB = tableB.toLowerCase();

		var reverseMappings = {};
		xn.withEachOwnProperty(columnMappings, function (k, v) {
			!v && (v = k);
			columnMappings[k] = v;
			reverseMappings[v] = k;
		});

		this.mappings.push({ source: tableA, target: tableB, columnMappings: columnMappings, fn: aToBFn });
		this.mappings.push({ source: tableB, target: tableA, columnMappings: reverseMappings, fn: bToAFn });
	},

	mapRecords: function (map, records) {
		return records.select(function (r) {
			var m = {};
			xn.withEachOwnProperty(map.columnMappings, function (k, v) { m[v] = r[k] });
			map.fn && map.fn(r, m);
			return m;
		});
	},

	watchStore: function (store, config) {
		config = config || {};

		Ext.applyIf(config, {
			store: store,
			dbRefresh: true,
			sourceTable: (config.sourceTable || store.sourceTable).toLowerCase(),
			uiContainer: null
		});

		this.stores[store.storeId] = config;
		store.on('write', this.handleStoreWrite, this);
		this.updateRefreshTasks();
	},

	stopWatching: function (store) {
		store.removeListener('write', this.handleStoreWrite, this);
		delete this.stores[store.id];
		this.updateRefreshTasks();
	},

	handleStoreWrite: function (store, action, result, res, rs) {
		var successProperty = store.reader.meta.successProperty;
		if (!res[successProperty]) {
			return;
		}

		rs = [].concat(rs).select(function () { return this.data; });
		var isDelete = (action == 'destroy');
		var changedRecords = isDelete ? [] : rs;
		var deletedRecords = isDelete ? rs : [];

		var affectedTable = this.stores[store.storeId].sourceTable;
		this.fireEvent('crudBroadcast', affectedTable, true, store, changedRecords, deletedRecords);

		this.mappings.where(function () { return this.source == affectedTable; }).each(function (m) {
			var mappedChanges = this.mapRecords(m, changedRecords);
			var mappedDeletes = this.mapRecords(m, deletedRecords);
			this.fireEvent('crudBroadcast', m.target, true, store, mappedChanges, mappedDeletes);
		}, this);
	},

	handleCrudBroadcast: function (affectedTable, hasDetails, changedStore, changedRecords, deletedRecords) {
		(this.tableWatchers[affectedTable] || []).each(function () { this(affectedTable, hasDetails, changedStore, changedRecords, deletedRecords); });

		xn.withEachOwnProperty(this.stores, function (storeId, config) {
			if (changedStore && changedStore.storeId == storeId) {
				return;
			}

			if (config.sourceTable != affectedTable.toLowerCase()) {
				return;
			}

			var isVisible = config.uiContainer && config.uiContainer.isVisible();

			if (hasDetails) {
				config.store.xnMerge(changedRecords, deletedRecords, isVisible);
			} else {
				config.store.xnOnExternalModification(isVisible);
			}
		});
	},

	watchTables: function (tables, fn) {
		[ ].concat(tables).each(function (t) {
			!this.tableWatchers[t] && (this.tableWatchers[t] = []);
			this.tableWatchers[t].push(fn);
		}, this);
	},

	updateRefreshTasks: function () {

	}
});

