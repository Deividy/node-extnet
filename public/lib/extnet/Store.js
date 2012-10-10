
xn.Store = Ext.extend(Ext.data.Store, {
	xnIsPaged: false,
	xnAllowAddsOnMerge: true,

	constructor: function (config) {
		config.storeId = config.storeId || config.id || Ext.id(null, 'store');
		config.sourceTable = (config.sourceTable || config.storeId);
		xn.Store.superclass.constructor.call(this, config);
	},

	cloneJsonStore: function (fieldsToInclude, storeCfg, recordsToClone) {
		var initialConfig = storeCfg || {};
		var fields = fieldsToInclude;
		var meta = this.reader.meta;

		fields = [].concat(fields || this.reader.meta.fields.select(function () { return this.name }));

		var id = meta.idProperty;
		if (id && !fields.contains(id)) {
			fields.unshift(id);
		}

		var sortCfg = {};

		if (this.hasMultiSort) {
			var sorters = [];
			Ext.each(this.multiSortInfo, function () {
				sorters.push({ field: this.field, direction: this.direction });
			});

			Ext.apply(sortCfg, {
				multiSort: true,
				multiSortInfo: {
					sorters: sorters,
					direction: this.multiSortInfo.direction
				}
			});

		} else if (this.sortInfo) {
			sortCfg.sortInfo = {
				field: this.sortInfo.field,
				direction: this.sortInfo.direction
			};

		}

		Ext.applyIf(initialConfig, sortCfg);

		var config = Ext.apply(initialConfig, meta);
		config.fields = meta.fields.where(function () { return fields.contains(this.name) });

		config.root = meta.root;

		config.sourceTable = this.sourceTable;
		var data = this.snapshot || this.allData || this.data;

		config.reader = new Ext.data.JsonReader(config);

		recordsToClone = recordsToClone || data.items;

		var newStore = Ext.isDefined(xn.PagingStore) ? new xn.PagingStore(config) : new xn.Store(config);
		newStore.regularLoad = newStore.load;
		newStore.load = function (options) {
			this.storeOptions(options);

			if (!this.fireEvent('beforeload', newStore)) {
				return false;
			};

			var initialData = {};
			var records = [];
			Ext.each(recordsToClone, function () {
				var r = {};

				for (var i = 0; i < fields.length; i++) {
					var f = fields[i];
					r[f] = this.data[f];
				}

				records.push(r);
			});

			initialData[meta.root] = records;
			initialData[meta.totalProperty] = records.length;
			newStore.loadData(initialData, false, options ? options.params : {});

			this.load = this.regularLoad;
			delete this.regularLoad;

			return true;
		}

		return newStore;
	},

	xnHasFullDataset: function () {
		return !this.xnIsPaged || this.xnIsClientPaged;
	},

	xnOnExternalModification: function (isVisible) {
		if (!isVisible && !this.xnRefreshOnBackground) {
			return;
		}

		this.xnForceLoad();
	},

	xnForceLoad: function () {
		this.load(this.lastOptions);
	},

	xnMerge: function (rowsToMerge, rowsOrIdsToDelete, isVisible) {
		rowsToMerge = [].concat(rowsToMerge);
		rowsOrIdsToDelete = [].concat(rowsOrIdsToDelete);

		var idsToDelete = rowsOrIdsToDelete.select(function (o) { return Ext.isObject(o) ? o.id : o; });
		rowsToMerge = rowsToMerge.where(function (r) { return !idsToDelete.contains(r.id); });

		if (0 == rowsToMerge.length && 0 == rowsOrIdsToDelete.length) {
			return;
		}

		var addedRows = [];
		var updatedRows = [];
		rowsToMerge.each(function (freshRow) {
			var existing = this.getById(freshRow.id);
			if (existing) {
				updatedRows.push({ r: existing, newData: freshRow });
			} else {
				addedRows.push(freshRow);
			}
		}, this);

		if ((idsToDelete.length > 0 || addedRows.length > 0) && !this.xnHasFullDataset()) {
			this.xnOnExternalModification(isVisible);
			return;
		}

		this.suspendEvents(false);

		var clearedFilter = false;
		if (this.isFiltered()) {
			clearedFilter = true;
			this.clearFilter(true);
		}

		idsToDelete.each(function (id) { this.removeById(id); }, this);
		updatedRows.each(function () { Ext.apply(this.r.data, this.newData); });

		if (addedRows.length > 0 && this.xnAllowAddsOnMerge) {
			var data = {};
			data[this.reader.meta.root] = addedRows;
			data[this.reader.meta.successProperty] = true;

			var addedRecords = this.reader.readRecords(data).records;
			this.add(addedRecords);
		}

		if (clearedFilter && this.lastFilter) {
			this.filterBy(this.lastFilter, this, true);
		}

		this.applySort && this.applySort(true);
		this.forcePaging && this.forcePaging();
		this.resumeEvents();
		this.fireEvent('datachanged', this);
	},

	removeById: function (id) {
		var existingRecord = this.getById(id);
		if (existingRecord) {
			this.remove(existingRecord);
			return true;
		}

		return false;
	},

	setPagingProperties: function (o, start, limit) {
		var pn = this.paramNames;
		o[pn.start] = start;
		o[pn.limit] = limit;
		return o;
	},

	applySort: function (silent) {
		if ((this.sortInfo || this.multiSortInfo) && !this.remoteSort) {
			this.sortData(silent);
		}
	}
});
