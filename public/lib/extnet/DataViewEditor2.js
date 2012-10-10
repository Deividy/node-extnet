// MUST: destroy editors when their DataView rows are wiped out
xn.components.DataViewEditorPlugin2 = function () {
    var destroyEditors = function (viewItem) {
        if (!Ext.isDefined(viewItem.editors)) {
            return;
        }
        
        viewItem.editors.each(function (e) {
            e.destroy();
        });
    };

    return Ext.extend(Object, {
        editorCfgs: [],
        readOnly: false,
        editableCellSelector: 'span.x-editable',

        constructor: function (cfg) {
            Ext.apply(this, cfg);
            this.initialCfg = cfg;
        },

        init: function (view) {
            this.view = view;
            var me = view.editorPlugin = this;

            var oldRefresh = view.refresh;
            view.refresh = function () {
                view.all.elements.each(destroyEditors);
                oldRefresh.call(this);
                if (me.readOnly) {
                    return;
                }
                view.editorPlugin.initEditors();
            };

            view.onAdd = view.onAdd.createSequence(function () { this.initEditors(); }, this);
            view.onUpdate = Ext.emptyFn;
            view.onRemove = view.onRemove.createInterceptor(function (ds, record, index) {
                destroyEditors(view.all.elements[index]);
            });


            view.setReadOnly = function (readOnly) {
                var ro = readOnly || false;
                if (me.readOnly == ro) {
                    return;
                }
                me.readOnly = ro;
                view.refresh();
            };
        },

        initEditors: function () {
            var el = this.view.getTemplateTarget();
            var rows = Ext.query(this.view.itemSelector, el.dom);

            Ext.each(rows, function (r, idxRow) {
                var viewItem = this.view.all.elements[idxRow];
                if (viewItem.editors) {
                    return;
                }

                viewItem.editors = [];
                var idxColumns = Ext.query(this.editableCellSelector, r);
                Ext.each(idxColumns, function (c, idxCol) {
                    viewItem.editors.push(this.initEditor(idxRow, idxCol, c));
                }, this);
            }, this);
        },

        initEditor: function (idxRow, idxCol, cell) {
            var ed = Ext.create(Ext.applyIf(this.editorCfgs[idxCol], { width: 'auto' }), 'textfield'),
			    r = this.view.store.getAt(idxRow),
			    el = Ext.get(cell);

            var v = cell.innerHTML;
            if (v !== '') {
                ed.setValue(v);
                ed.originalValue = ed.getValue();
            }

            ed.record = r;
            ed.on('change', this.onChange);
            ed.render(el.parent(), cell);

            if (!Ext.isNumber(ed.width)) {
                ed.setWidth(el.parent().getWidth(true));
            }

            el.remove();
            this.container.add(ed);
            return ed;
        },

        // private
        onChange: function (field, newValue, oldValue) {
            field.record.set(field.name, newValue);
        }
    });
} ();