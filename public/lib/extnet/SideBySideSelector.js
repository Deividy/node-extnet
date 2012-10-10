
Ext.namespace('xn.components');

xn.components.SideBySideSelector = Ext.extend(Ext.Panel, {
	loadMask: {
		removeMask: true
	},

	layout: 'hbox',

	layoutConfig: {
		align: 'stretch',
		pack: 'start'
	},

	filterLabel: 'Search',

	columnModelDefaults: {
		defaults: {
			sortable: true
		}
	},

	selectionModelDefaults: {
		singleSelect: false
	},

	gridDefaults: {
		xtype: 'grid',
		flex: 1,
		viewConfig: { forceFit: true, autoFill: true },
		stripeRows: true,
		unstyled: true,
		enableHdMenu: false
	},

	searchFieldCfg: {
		width: 180,
		autoFilter: true,
		autoFilterBuffer: 500,
		minFilterLength: 3
	},

	initComponent: function () {
		this.configureDataStores();

		this.initActions();

		var gridCfg = this.getGridConfigs();



		Ext.applyIf(this, {

			tbar: [
					this.filterLabel, ' ',
					Ext.apply({ xtype: 'xnSearchField', store: this.store }, this.searchFieldCfg), '-', ' ',
					this.actions.selectAll,
					this.actions.selectNone, '->',
					this.actions.clearAll
			],

			srcGridConfig: gridCfg.src,

			centerCt: {
				width: 30,
				xtype: 'container',
				cls: 'x-toolbar',
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'center'
				},
				defaults: {
					xtype: 'button',
					width: 25
				},
				items: [
					this.actions.selectMulti,
					this.actions.selectSingle,
					this.actions.deselectSingle,
					this.actions.deselectMulti
				]
			},

			dstGridConfig: gridCfg.dst
		});

		this.items = [this.srcGridConfig, this.centerCt, this.dstGridConfig];
		xn.components.SideBySideSelector.superclass.initComponent.apply(this, arguments);
	},

	// private
	configureDataStores: function () {
		// check and correct shorthanded configs
		if (this.ds) {
			this.store = this.ds;
			delete this.ds;
		}

		this.store = Ext.StoreMgr.lookup(this.store);

		this.store.on({
			'add': this.onSrcStoreDataChanged,
			'remove': this.onSrcStoreDataChanged,
			'datachanged': this.onSrcStoreDataChanged,
			scope: this
		});

		var meta = this.store.reader.meta;

		this.dstStore = this.store.cloneJsonStore(null, {
			storeId: this.getId() + '-dstStore',
			listeners: {
				'add': this.onDstStoreDataChanged,
				'remove': this.onDstStoreDataChanged,
				'datachanged': this.onDstStoreDataChanged,
				scope: this
			}
		}, []);
	},

	// private

	initActions: function () {
		this.actions = {
			selectAll: new Ext.Action({
				text: 'Select All',
				handler: this.onSelectAll,
				scope: this
			}),
			selectNone: new Ext.Action({
				text: 'Select None',
				handler: this.onSelectNone,
				disabled: true,
				scope: this
			}),
			clearAll: new Ext.Action({
				text: 'Clear All',
				handler: this.onClear,
				disabled: true,
				scope: this
			}),
			selectMulti: new Ext.Action({
				iconCls: 'misc-double-angle-right',
				handler: this.onAddAll,
				scope: this
			}),
			selectSingle: new Ext.Action({
				iconCls: 'misc-angle-right',
				handler: this.moveToDst,
				disabled: true,
				scope: this
			}),
			deselectSingle: new Ext.Action({
				iconCls: 'misc-angle-left',
				handler: this.moveToSrc,
				disabled: true,
				scope: this
			}),
			deselectMulti: new Ext.Action({
				iconCls: 'misc-double-angle-left',
				handler: this.onClear,
				disabled: true,
				scope: this
			})
		};
	},

	// private
	getGridConfigs: function () {

		var srcGridConfig = Ext.applyIf(this.srcGridConfig || {}, this.gridDefaults);

		var srcColModelConfig = { columns: (this.columns || []).slice(0) };
		Ext.applyIf(srcColModelConfig, this.columnModelDefaults);

		Ext.apply(srcGridConfig, {
			store: this.store,
			itemId: 'srcGrid',
			ref: 'srcGrid',
			cm: new Ext.grid.ColumnModel(srcColModelConfig),
			sm: new Ext.grid.RowSelectionModel(Ext.apply({
				listeners: {
					'selectionchange': this.onSrcSelectionChange,
					scope: this
				}
			}, this.selectionModelDefaults)),
			listeners: {
				'rowdblclick': this.onSrcDblClick,
				scope: this
			}
		});

		var dstGridConfig = Ext.apply(this.dstGridConfig || {}, { store: this.dstStore }, this.gridDefaults);

		var dstColModelConfig = { columns: (this.columns || []).slice(0) };
		Ext.applyIf(dstColModelConfig, this.columnModelDefaults);

		Ext.apply(dstGridConfig, {
			itemId: 'dstGrid',
			ref: 'dstGrid',
			cm: new Ext.grid.ColumnModel(dstColModelConfig),
			sm: new Ext.grid.RowSelectionModel(Ext.apply({
				listeners: {
					'selectionchange': this.onDstSelectionChange,
					scope: this
				}
			}, this.selectionModelDefaults)),
			listeners: {
				'rowdblclick': this.onDstDblClick,
				scope: this
			}
		});

		return { src: srcGridConfig, dst: dstGridConfig };
	},

	// private
	initEvents: function () {
		xn.components.SideBySideSelector.superclass.initEvents.call(this);

		if (this.loadMask) {
			this.loadMask = new Ext.LoadMask(this.bwrap,
					Ext.apply({ store: this.store }, this.loadMask));
		}
	},

	// private
	getSelections: function (grid) {
		return grid.getSelectionModel().getSelections();
	},

	// private
	moveRecords: function (src, dst, records) {
		var changedrecords = Ext.pluck(records, 'data');
		dst.xnMerge(changedrecords.slice(0), [], true);
		src.xnMerge([], changedrecords.slice(0), true);
	},

	// private
	moveToDst: function () {
		var records = this.getSelections(this.srcGrid);
		this.moveRecords(this.store, this.dstStore, records);
		this.onSrcSelectionChange();
	},

	// private
	moveToSrc: function () {
		var records = this.getSelections(this.dstGrid);
		this.moveRecords(this.dstStore, this.store, records);
		this.onDstSelectionChange();
	},

	// private
	onSelectAll: function () {
		this.srcGrid.getSelectionModel().selectRange(0, this.store.getCount() - 1);
	},

	// private
	onSelectNone: function () {
		this.srcGrid.getSelectionModel().clearSelections();
	},

	// private
	onClear: function () {
		this.moveRecords(this.dstStore, this.store, this.dstStore.getRange());
	},

	onAddAll: function () {
		this.moveRecords(this.store, this.dstStore, this.store.getRange());
	},

	// private
	onSrcDblClick: function (grid, n, evt) {
		this.moveRecords(this.store, this.dstStore, [this.store.getAt(n)]);
	},

	// private
	onSrcSelectionChange: function () {
		var selCount = this.srcGrid.getSelectionModel().getCount();
		this.actions.selectNone.setDisabled(selCount == 0);
		this.actions.selectSingle.setDisabled(selCount == 0);
	},

	// private
	onDstDblClick: function (grid, n, evt) {
		this.moveRecords(this.dstStore, this.store, [this.dstStore.getAt(n)]);
	},

	// private
	onDstSelectionChange: function () {
		var selCount = this.dstGrid.getSelectionModel().getCount();
		this.actions.deselectSingle.setDisabled(selCount == 0);
	},

	// private
	onSrcStoreDataChanged: function (s) {
		this.actions.selectAll.setDisabled(s.getCount() == 0);
		this.actions.selectMulti.setDisabled(s.getCount() == 0);
	},

	// private
	onDstStoreDataChanged: function (s) {
		this.actions.clearAll.setDisabled(s.getCount() == 0);
		this.actions.deselectMulti.setDisabled(s.getCount() == 0);
	},

	getSelectedIds: function () {
		var s = this.dstStore;
		return s.collect(s.reader.meta.idProperty, false, true);
	},

	reset: function () {
		this.onClear();
	},

	afterRender: function () {
		xn.components.SideBySideSelector.superclass.afterRender.call(this);
		this.store.load();
		this.dstStore.load();
	}
});

Ext.reg('sidebyside', xn.components.SideBySideSelector);
