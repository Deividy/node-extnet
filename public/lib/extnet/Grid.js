
Ext.namespace('xn.components');

xn.components.Action = Ext.extend(Object, {
	constructor: function (config) {
		Ext.apply(this, config);
	},

	init: function (grid) {
		this.grid = grid;

		grid.xnActions.push(this);

		var clickHandler = { fn: this.handler, scope: this };
		grid.getActiveToolbar().add([{ xtype: 'button', text: this.text, listeners: { click: clickHandler }, iconCls: this.iconCls, id: grid.xnMinder.getId('btn' + this.name)}]);
		grid.addSpacer();
	},

	handler: function (b, e) { },

	setActive: function () {
		var isActive = this.isActive(this);
		this.grid.xnMinder['btn' + this.name].setDisabled(!isActive);
	},

	isActive: function (action) { return true; }
});

xn.components.Action.oneItemSelected = function (action) {
	return action.grid.getSelectionModel().getCount() == 1;
}

xn.components.Action.oneOrManyItemsSelected = function (action) {
	return action.grid.getSelectionModel().getCount() >= 1;
}

xn.components.Action.manyItemsSelected = function (action) {
	return action.grid.getSelectionModel().getCount() > 1;
}

xn.components.addSpacer = {
	init: function(grid) {
		grid.addSpacer();
	}
}

xn.components.addTextItem = function(text) {
    return {
        init: function(grid) {
            grid.addTextItem(text);
        }
    };
};

xn.components.addExtraToolbar = {
	init: function(grid) {
		grid.addExtraToolbar();
	}
}

xn.components.AutoForm = Ext.extend(Object, {
	initialCfg: null,
	addButton: null,
	editButton: null,
	highlightModified: true,
	highlightOpts: {
		attr: "backgroundColor",
		easing: 'easeOut',
		duration: 3
	},
	updatedColor: '#ffff9c',
	insertedColor: '#9AFE9A',
	constructor: function (initialCfg) {
		var me = this;
		me.initialCfg = initialCfg;
		Ext.apply(me, initialCfg);
		Ext.apply(me.formCfg, {
			buttons: [{
				text: 'Save',
				formBind: true,
				handler: function () {
					me.form.submit();
				}
			}, {
				text: 'Cancel',
				handler: function () {
					me.window.hide();				  
				}
			}],
			buttonAlign: 'left'
		});
	},

	init: function (grid) {
		var me = this;
		me.grid = grid;

		var sm = grid.getSelectionModel();

		if (!me.form) {
			me.form = new xn.components.FormPanel(me.formCfg);
			me.form.on('success', function () {
				me.window.hide();

				var gridView = me.grid.getView();
				var rowIdx = me.form.activeIndex(), created = false;
				if (rowIdx == -1) {
					rowIdx = me.form.store.indexOf(me.form.getRecord());
					created = true;
				}

				gridView.focusRow(rowIdx);
				me.form.reset();

				sm.selectRow(rowIdx, !sm.singleSelect);

				if (!me.highlightModified) {
					return;
				}

				var row = gridView.getRow(rowIdx);

				Ext.fly(row).removeClass('x-grid3-row-selected');

				var color = created ? me.insertedColor : me.updatedColor;
				var attr = me.highlightOpts.attr;
				var restore = Ext.fly(row).getColor(attr) || "#ffffff";

				if (Ext.enableFx) {
					Ext.fly(row).highlight(color, me.highlightOpts);
				} else {
					row.style[attr] = color;
				}

				(function () {
					Ext.fly(row).addClass('x-grid3-row-selected');
					if (!Ext.enableFx) {
						row.style[attr] = restore;
					}
				}).defer(me.highlightOpts.duration * 1000);
			});
		}

		if (!me.window) {
			Ext.apply(me.windowCfg, { items: me.form });
			me.window = new Ext.Window(me.windowCfg);
		}

		var showAddForm = function () {
			me.form.reset();
			me.form.createRecord();
			me.window.show();
		};




		sm.on('selectionchange', function (o) {
			if (!me.editButton || !me.editButton.rendered) {
				return;
			}

			if (sm.getCount() == 1) {
				me.editButton.enable();
			} else {
				me.editButton.disable();
			}

		});

		var showEditForm = function () {
			var selected = sm.getSelected();
			if (!selected) {
				return;
			}

			var index = grid.getStore().indexOf(selected);

			if (index == -1) {
				return;
			}

			me.form.reset();
			me.form.doMove(index);
			me.window.show();
		};

		Ext.applyIf(grid, {
			ShowAddForm: showAddForm,
			ShowEditForm: showEditForm
		});

		Ext.applyIf(me.addButtonCfg, { handler: showAddForm });
		Ext.applyIf(me.editButtonCfg, { handler: showEditForm });

		var toolbar = grid.getActiveToolbar();

		if (!toolbar) {
			return;
		}

		if (me.renderAddButton && !me.addButton) {
			if (toolbar.items.getCount() > 0) {
				toolbar.addSpacer();
			}
			me.addButton = new Ext.Button(me.addButtonCfg);
			toolbar.addButton(me.addButton);
		}

		if (me.renderEditButton && !me.editButton) {
			if (toolbar.items.getCount() > 0) {
				toolbar.addSpacer();
			}
			me.editButton = new Ext.Button(me.editButtonCfg);

			if (!me.editButton.disabled && sm.getCount() != 1) {
				me.editButton.disable();
			}

			toolbar.addButton(me.editButton);
		}
	}
});

xn.components.ColumnGrouper = Ext.extend(Object, {
	constructor: function(columnInfo) {
		Ext.apply(this, columnInfo);
	},
	
	init: function(grid) {
		this.grid = grid;
		this.columnModel = grid.getColumnModel();
		this.showGroup(this.initialGroup);
		
		grid.addSpacer();
		grid.getActiveToolbar().add([
			{ xtype: 'tbtext', text: 'View:' },
			{ xtype: 'combo', store: this.groupNames.toArrayStore(), mode: 'local', valueField: 'name', displayField: 'name', triggerAction: 'all', value: this.initialGroup, editable: false,
				listeners: { scope: this, 'select': this.select } }
		]);
		grid.addSpacer();
	},
	
	select: function(combo, record, index) {
		this.showGroup(combo.getValue());
	},
	
	showGroup: function(groupName) {
		var cm = this.grid.getColumnModel();
		cm.suspendEvents();
		
		var idx = cm.config[0].dataIndex ? 0 : 1;
				
		for(var i = 0; i < this.headerColumns.length; i++) {
			this.showColumn(this.headerColumns[i], idx);
			idx++;
		}
		
		var group = this.columnsByGroupName[groupName];
		for(var i = 0; i < group.length; i++) {
			this.showColumn(group[i], idx);
			idx++;
		}
				
		for(; idx < cm.config.length; idx++) {
			cm.setHidden(idx, true);
		}
		
		cm.resumeEvents();
		cm.fireEvent('configchange', cm);
	},
	
	showColumn: function(dataIndex, idx) {
		var cm = this.grid.getColumnModel();
		
		var idxCurrent = cm.findColumnIndex(dataIndex);
		cm.setHidden(idxCurrent, false);
		cm.moveColumn(idxCurrent, idx);
	}
});

xn.components.ClientSideFilter = Ext.extend(Object, {
	constructor: function (config) {
		if (config) {
			Ext.apply(this, config);
		}
	},

	init: function (grid) {
		this.grid = grid;
		grid.filters.push(this);

		this.doInit(grid);
	},

	prepareForFiltering: function () { return false },
	filter: function (r) { },
	doInit: function (grid) { }
});

xn.components.SearchFilter = Ext.extend(xn.components.ClientSideFilter, {
	searchField: null,

	doInit: function(grid) {
		var keyHandler = { fn: grid.filterGrid, scope: grid, buffer: 500 };

		this.searchBoxId = Ext.id();

		grid.getActiveToolbar().add([
			{ xtype: 'tbspacer', width: 8 },
			{ xtype: 'tbtext', text: 'Search:' },
			{
				xtype: 'textfield', enableKeyEvents: true, listeners: { keyup: keyHandler },
				id: this.searchBoxId
			}
		]);
	},

	prepareForFiltering: function() {
		if (!this.txtSearchBox) {
			this.txtSearchBox = Ext.ComponentMgr.get(this.searchBoxId);
		}

		this.searchRegExp = null;
		this.searchField = null;

		var query = this.txtSearchBox.getValue().trim();

		if (!query) {
			return false;
		}
		var fieldValuePairRegExp = new RegExp('(.+):\s*(.*)','i');
		var kvp = fieldValuePairRegExp.exec(query);
		if (kvp != null) {
			this.searchField = kvp[1].trim().toLowerCase();
			query = kvp[2];
		}

		this.searchRegExp = query ? new RegExp(query, "i") : null;
		return this.searchRegExp !== null;
	},

	filter: function(data) {
		if (!this.searchRegExp) {
			return true;
		}

		for (var prop in data) {
			if (this.searchField !== null && prop.toLowerCase() != this.searchField) {
				continue;
			}
			
			var v = data[prop];

			if (v === null || v === undefined) {
				continue;
			}

			v = v.toString();


			if (v.search(this.searchRegExp) != -1) {
				return true;
			}

		}

		return false;
	}
});

xn.components.RemoteSearchFilter = Ext.extend(Object, {
	constructor: function (config) {
		Ext.apply(this, config);
		this.initialConfig = config || {};
	},
	init: function (grid) {
		this.field = new xn.components.RemoteSearchField(Ext.apply(this.initialConfig, { store: grid.getStore() }));
		grid.getActiveToolbar().add([
			{ xtype: 'tbspacer', width: 8 },
			{ xtype: 'tbtext', text: 'Search:' },
			this.field
		]);		
	}
});

xn.components.ServerSideDateFilter = Ext.extend(Object, {
	dateFormat: 'm/d/Y',

	constructor: function(config) {
		Ext.apply(this, config);
	},

	init: function(grid) {
		this.grid = grid;

		this.startDate = (this.startDate || new Date()).withoutTime();
		this.endDate = (this.endDate || new Date()).withoutTime();
		this.applyDateRangeToStore();
		
		var dateControlChangeHandler = { fn: this.dateControlsChanged, scope: this };
		
		var dateControlSelectHandler = {
			fn: function(field, newValue) {
				this.dateControlsChanged(field,newValue);
			},
			
			scope: this 
		}
		
		var dateControlKeyHandler = {
				fn: function(field, e) {
					if (field.validate()) {
						this.dateControlsChanged(field,field.getValue());
					}
				}, 
				scope: this,
				buffer: 500
		}
		
		this.dtFrom = new Ext.form.DateField({
			format: this.dateFormat,
			listeners: { change: dateControlChangeHandler, select: dateControlSelectHandler, keyup: dateControlKeyHandler },
			enableKeyEvents: true,
			value: this.startDate
		});
		
		this.dtTo = new Ext.form.DateField({
			format: this.dateFormat,
			listeners: { change: dateControlChangeHandler, select: dateControlSelectHandler, keyup: dateControlKeyHandler },				
			enableKeyEvents: true,
			value: this.endDate
		});			
		
		grid.getActiveToolbar().add(
			' ',
			{xtype: 'tbtext', text: 'From:'},
			this.dtFrom,				
			' ', ' ',
			{ xtype: 'tbtext', text: 'To:'},
			this.dtTo 
		);
	},
	
	dateControlsChanged: function(field, newValue) { 
		if (!this.dtFrom.getValue() || !this.dtTo.getValue()) {
			return;
		}
		
		dtFrom = ((field == this.dtFrom) ? newValue : this.dtFrom.getValue()).withoutTime();
		dtTo = ((field == this.dtTo) ? newValue : this.dtTo.getValue()).withoutTime();
		
		if ((dtFrom.valueOf() == this.startDate.valueOf()) && (dtTo.valueOf() == this.endDate.valueOf())) {
			return;
		}
		
		this.startDate = dtFrom;
		this.endDate = dtTo;
		this.applyDateRangeToStore();
		this.grid.loadNewData();
	},
	
	applyDateRangeToStore: function() {
		this.grid.store.setBaseParam('startDate', this.startDate.format('c'));
		this.grid.store.setBaseParam('endDate', this.endDate.format('c'));
	}
});


xn.components.PagingToolbarPlugin = Ext.extend(Object, {
	init: function(grid) {
		this.grid = grid;
		
		var t = new Ext.PagingToolbar({ store: grid.store, pageSize: grid.store.pageSize, cls: 'xn-noborder xn-nobackground' });
		grid.getActiveToolbar().add( { xtype: 'tbspacer', width: 20 }, t );
		grid.pagingToolbar = t;
	}
});

xn.components.GridViewInserter = Ext.extend(Ext.Container, {
	insertAt: 'mainWrap',
	baseCls: 'x-grid-3-{0}-insert ',
	layout: 'fit',
	trackGridBodyWidth: true,

	init: function (grid) {
		this.grid = grid;
		this.view = grid.getView();
		this.grid.on('viewready', this.handleViewReady, this);

		if (this.ref && !Ext.isDefined(this.grid[this.ref])) {
			this.grid[this.ref] = this;
		}

		var cls = String.format(this.baseCls, this.insertAt);

		Ext.apply(this, {
			cls: this.cls ? cls + this.cls : cls
		});

	},

	handleViewReady: function () {
		if (this.rendered) {
			return;
		}

		var view = this.view, me = this;

		Ext.apply(view, {
			regularOnLayout: view.onLayout,
			onLayout: function (vw, vh) {
				view.regularOnLayout(vw, vh);

				if (!me.grid.autoHeight && me.isVisible()) {
					var h = vh - me.getOuterSize().height;
					view.scroller.setSize(vw, h > 0 ? h : 0);
				}

				if (Ext.isDefined(me.layout.layout)) {
					me.doLayout();
				}

			},
			regularColumnWidthUpdated: view.onColumnWidthUpdated,
			onColumnWidthUpdated: function (col, w, tw) {
				view.regularColumnWidthUpdated(col, w, tw);
				me.onViewResizing(tw);
			},
			regularOnAllColumnWidthsUpdated: view.onAllColumnWidthsUpdated,
			onAllColumnWidthsUpdated: function (ws, tw) {
				view.regularOnAllColumnWidthsUpdated(ws, tw);
				me.onViewResizing(tw);
			},
			regularOnColumnHiddenUpdated: view.onColumnHiddenUpdated,
			onColumnHiddenUpdated: function (col, hidden, tw) {
				view.regularOnColumnHiddenUpdated(col, hidden, tw);
				me.onViewResizing(tw);
			},
			processEvent: view.processEvent.createInterceptor(function (name, e) {
				var t = e.getTarget();
				return (this.el.dom != t && !this.el.contains(t));
			}, me)
		});

		this.render(this.view[this.insertAt], this.position);
		view.layout();
	},

	onViewResizing: function (w) {
		if (!this.trackGridBodyWidth || !this.isVisible()) {
			return;
		}
		var tw = (parseInt(w,10) || this.view.mainBody.getWidth()) + this.view.getScrollOffset();
		this.viewResizing = true;
		this.setWidth(tw);
		this.doLayout();
		this.viewResizing = false;
	},

	onResize: function (adjWidth, adjHeight, rawWidth, rawHeight) {
		xn.components.GridViewInserter.superclass.onResize.apply(this, arguments);
		if (!this.viewResizing) {
			this.view.layout();
		}
	},

	onShow: function () {
		xn.components.GridViewInserter.superclass.onShow.apply(this, arguments);
		this.view.layout();
	},

	onHide: function () {
		xn.components.GridViewInserter.superclass.onHide.apply(this, arguments);
		this.view.layout();
	}
});


xn.components.GridView = Ext.extend(Ext.grid.GridView, {
	initTemplates: function() {
		var ts = this.templates || {};
		if (!ts.hcell) {
			ts.hcell = new Ext.Template(
						'<td class="x-grid3-hd x-grid3-cell x-grid3-td-{id} {css}" style="{style}"><div {tooltip} {attr} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
						'<span class="x-grid3-hd-txt">{value}</span>',
						'<img class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
						'</div></td>'
						);
		}
		this.templates = ts;
		xn.components.GridView.superclass.initTemplates.call(this);
	},

	adjustHeaderContents: function(hd) {
		if (!hd instanceof Ext.Element) {
			hd = Ext.get(hd);
		}
		if (!hd) {
			return;
		}

		var hdinner = hd.child('.x-grid3-hd-inner');

		var hdheight = hd.getHeight();

		hdinner.setHeight(hdheight);

		var hdbtn = hdinner.child('.x-grid3-hd-btn');

		var el = hdinner.first();

		do {
			if (el != hdbtn && el.isVisible()) {
				var xy = el.getAlignToXY(hdinner, 'c-c');
				xy[0] = el.getX();
				el.setXY(xy);
			}
			el = el.next();
		} while (null !== el);
	},

	handleHdOver: function(e, t) {
		var hd = this.findHeaderCell(t);
		if (hd && !this.headersDisabled) {
			var fly = this.fly(hd);

			this.activeHdRef = t;
			this.activeHdIndex = this.getCellIndex(hd);
			this.activeHdRegion = fly.getRegion();

			if (!this.cm.isMenuDisabled(this.activeHdIndex)) {
				this.adjustHeaderContents(fly);
				fly.addClass('x-grid3-hd-over');
				this.activeHdBtn = fly.child('.x-grid3-hd-btn');
				if (this.activeHdBtn) {
					this.activeHdBtn.dom.style.height = (hd.firstChild.offsetHeight - 1) + 'px';
				}
			}
		}
	},

	updateSortIcon : function(col, dir){
		var sc = this.sortClasses;
		var hds = this.mainHd.select('td').removeClass(sc);
		hds.item(col).addClass(sc[dir == 'DESC' ? 1 : 0]);
		this.adjustHeaderContents(hds.item(col));
	}	
});

xn.components.EditorGridPanel = Ext.extend(Ext.grid.EditorGridPanel, {
    iconCls: 'silk-grid',
    frame: true,
    canUpdate: false,
    clicksToEdit: 1,
    selectTextOnEdit: true,

    constructor: function (config) {
        if (!Ext.isDefined(config.view) || !Ext.isObject(config.view)) {
            Ext.applyIf(config, { viewConfig: { autoFill: true, forceFit: true} });
        }
        Ext.applyIf(config, { tbar: [], filters: [], extraTopToolbars: [] });

        this.xnMinder = new xn.ComponentMinder();
        this.xnActions = [];
        xn.components.EditorGridPanel.superclass.constructor.call(this, config);
    },

    initEvents: function () {
        xn.components.EditorGridPanel.superclass.initEvents.call(this);
        this.on("beforeedit", this.onBeforeEdit, this, [true]);
    },

    afterRender: function () {
        xn.components.EditorGridPanel.superclass.afterRender.call(this);

        for (var i = 0; i < this.extraTopToolbars.length; i++) {
            this.extraTopToolbars[i].render(this.tbar);
        }

        this.xnMinder.resolveIds();
        this.toggleActiveActions();

        var toggleActiveActions = this.toggleActiveActions.createDelegate(this);
        this.getSelectionModel().on('selectionchange', toggleActiveActions);
        this.store.on('datachanged', toggleActiveActions);
    },

    toggleActiveActions: function () {
        this.xnActions.each(function () { this.setActive(); });
    },

    addExtraToolbar: function () {
        var tb = new Ext.Toolbar();
        this.extraTopToolbars.push(tb);
        this.activeToolbar = tb;
    },

    getActiveToolbar: function () {
        if (0 == this.extraTopToolbars.length) {
            return this.getTopToolbar();
        }

        return this.extraTopToolbars.last();
    },

    filterGrid: function () {
        var canFilter = false;
        for (var i = 0; i < this.filters.length; i++) {
            canFilter = canFilter || this.filters[i].prepareForFiltering();
        }

        if (canFilter) {
            this.store.lastFilter = this.filterRecord.createDelegate(this);
            this.store.filterBy(this.store.lastFilter);
        } else {
            if (!this.store.lastFilter) {
                return;
            }

            this.store.lastFilter = null;
            this.store.clearFilter();
        }

        if (this.pagingToolbar) {
            this.store.load({ params: { start: 0, limit: this.pagingToolbar.pageSize} });
        }
    },

    filterRecord: function (record) {
        for (var i = 0; i < this.filters.length; i++) {
            if (!this.filters[i].filter(record.data)) {
                return false;
            }
        }

        return true;
    },

    loadNewData: function () {
        this.mustReapplySortDueToLoad = true;
        params = this.pagingToolbar ? { start: 0, limit: this.pagingToolbar.pageSize} : {};
        this.store.load(params);
    },

    onBeforeEdit: function (e) {
        return this.canUpdate && !e.field.readOnly;
    },

    addSpacer: function () {
        this.getActiveToolbar().add({ xtype: 'tbspacer', width: 8 });

    },
    addTextItem: function (label) {
        this.getActiveToolbar().add({ xtype: 'tbtext', text: label });
    },
    getView: function () {
        if (!this.view) {
            this.view = new xn.components.GridView(this.viewConfig);
        }
        return this.view;
    },

    startEditing: function (row, col) {
        xn.components.EditorGridPanel.superclass.startEditing.call(this, row, col);

        if (!this.activeEditor || !this.selectTextOnEdit) {
            return;
        }

        this.activeEditor.field.focus(true, true);
    }

});

Ext.override(Ext.grid.CheckboxSelectionModel, {
	onEditorKey: function (field, e) {

		var k = e.getKey(), newCell, g = this.grid, last = g.lastEdit, ed = g.activeEditor, ae, last, r, c;
		var shift = e.shiftKey;
		if (k == e.TAB) {
			e.stopEvent();
			ed.completeEdit();
			if (shift) {
				newCell = g.walkCells(ed.row, ed.col - 1, -1, this.acceptsNav, this);
			}
			else {
				newCell = g.walkCells(ed.row, ed.col + 1, 1, this.acceptsNav, this);
			}
		}
		else
			if (k == e.ENTER) {
				if (this.moveEditorOnEnter !== false) {
					if (shift) {
						newCell = g.walkCells(last.row - 1, last.col, -1, this.acceptsNav, this);
					}
					else {
						newCell = g.walkCells(last.row + 1, last.col, 1, this.acceptsNav, this);
					}
				}
			}
		if (newCell) {
			r = newCell[0];
			c = newCell[1];

			if (!this.checkOnly && (last.row != r)) {
				this.selectRow(r); // *** highlight newly-selected cell and update selection
			}

			if (g.isEditor && g.editing) { // *** handle tabbing while editorgrid is in edit mode
				ae = g.activeEditor;
				if (ae && ae.field.triggerBlur) {
					// *** if activeEditor is a TriggerField, explicitly call its triggerBlur() method
					ae.field.triggerBlur();
				}
			}
			g.startEditing(r, c);
		}
	}
});
