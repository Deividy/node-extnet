xn.components.DataViewEditorPlugin = Ext.extend(Object, {
	readyOnly: false,
	editorCfgs: [],
	editableCellSelector: 'span.x-editable',
	autoMask: true,
	updatingMessage: 'Saving changes, please wait...',
	updatingMessageDelay: false,
	constructor: function (cfg) {
		Ext.apply(this, cfg);
		this.initialCfg = cfg;
	},
	init: function (view) {
		var me = this;

		me.view = view;
		
		me.view.on({
			scope: me,
			afterrender: me.onAfterRender
		});

		me.view.addEvents('beforeeditorsrefresh', 'aftereditorsrefresh', 'afteredit');

		Ext.apply(me.view, {
			editorPlugin: me,
			setReadOnly: function (readOnly) {
				var ro = readOnly || false;
				if (me.readOnly == ro) {
					return;
				}
				me.readOnly = ro;
				this.refresh();
			},
			getReadOnly: function () { return me.readOnly || false; },
			refreshOrig: me.view.refresh,
			refresh: function () {
				this.refreshOrig();
				me.refresh();
			},
			onUpdate: function (ds, record) {
				var index = this.store.indexOf(record);
				if (index > -1) {
					var sel = this.isSelected(index),
					original = this.all.elements[index],
					node = this.getNode(index);

					this.all.replaceElement(index, node, false);
					if (sel) {
						this.selected.replaceElement(original, node);
						this.all.item(index).addClass(this.selectedClass);
					}
					this.updateIndexes(index, index);
				}
				me.removeMask();
			},
			bufferRender: function (records, index) {
				var div = document.createElement('div');
				this.tpl.overwrite(div, this.collectData(records, index));
				me.initEditors(div, records[index]);
				return Ext.query(this.itemSelector, div);
			},
			editors: {}
		});

	},
	// private
	onAfterRender: function () {
		this.refresh();
	},

	onBeforeEditorsRefresh: function () {
		return this.view.fireEvent('beforeeditorsrefresh');
	},

	onAfterEditorsRefresh: function () {
		this.view.fireEvent('aftereditorsrefresh');
	},

	refresh: function () {
		if (this.readOnly || this.onBeforeEditorsRefresh() === false) {
			return;
		}
		var el = this.view.getTemplateTarget();
		this.view.editors = {};
		var rows = Ext.query(this.view.itemSelector, el.dom);
		Ext.each(rows, function (r, row) {
			var columns = Ext.query(this.editableCellSelector, r);
			Ext.each(columns, function (c, col) {
				this.initEditor(row, col, c);
			}, this);
		}, this);
		this.onAfterEditorsRefresh();
	},

	initEditor: function (row, col, cell, rec) {
		var r = !rec ? this.view.store.getAt(row) : rec,
			cfg = Ext.isFunction(this.editorCfgs[col]) ? this.editorCfgs[col].apply(this, [row, col, cell, rec]) : this.editorCfgs[col],
			ed = Ext.create(Ext.applyIf(cfg, { width: 'auto' }), 'textfield'),
			v = cell.innerHTML || '',
			el = Ext.get(cell);
		Ext.apply(ed, {
			row: row,
			col: col,
			record: r
		});

		if (!Ext.isDefined(this.view.editors[r.id])) {
			this.view.editors[r.id] = {};
		}

		this.view.editors[r.id][ed.name] = ed;

		ed.setValue(v);
		ed.originalValue = ed.getValue();
		ed.on({
			scope: this,
			change: this.onChange
		});
		ed.render(el.parent(), cell);
		if (!Ext.isNumber(ed.width)) {
			ed.setWidth(el.parent().getWidth(true));
		}
		el.remove();
	},
	// private
	onChange: function (field, newValue) {
		if (this.autoMask) {
			this.view.getEl().mask(this.updatingMessage);
		}
		var r = field.record,
			name = field.name;
		this.activeField = field;
		r.set(name, newValue);
		this.view.fireEvent('afteredit', r, name, this.view.getNode(r));
	},
	// private
	initEditors: function (row, rec) {
		var node = isNaN(row) ? Ext.getDom(row) : this.view.getNode(row);
		var columns = Ext.query(this.editableCellSelector, node);
		for (var col = 0; col < columns.length; col++) {
			this.initEditor(row, col, columns[col], rec);
		}
	},
	// private
	removeMask: function () {
		if (this.autoMask) {
			var el = this.view.getEl();
			if (this.updatingMessageDelay === false) {
				el.unmask();
			} else {
				el.unmask.defer(this.updatingMessageDelay, el);
			}

		}
	}
});