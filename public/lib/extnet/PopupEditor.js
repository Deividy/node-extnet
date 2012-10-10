
Ext.namespace('xn.components');

xn.components.PopupEditor = Ext.extend(Ext.form.TriggerField, {
	constructor: function(config) {
		var editor = this;
		config = Ext.applyIf(config || {}, {
			fieldCfg: {},
			windowCfg: {}
		});

		var fieldCfg = Ext.apply(config.fieldCfg || {}, { itemId: 'boundField' });

		delete config.fieldCfg;

		this.field = Ext.create(fieldCfg, 'textfield');
		
		var windowDefaults = {
			modal: true,
			height: 500,
			width: 500,
			maximizable: false,
			minimizable: false,
			hidden: true,
			closable: false,
			draggable: false,
			resizable: false,
			layout: 'fit',
			buttons: [{
					text: 'Ok',
					handler: function() {
						editor.completeEdit(false);
					}
				}, {
					text: 'Cancel',
					handler: function() {
						editor.cancelEdit(false);
					}
			}]
		};	
		
		this.windowCfg = Ext.applyIf(config.windowCfg, windowDefaults); 

		delete config.windowCfg;
		
		if (!Ext.isArray(this.windowCfg.items)) {
			this.windowCfg.items = [];
		}
		this.windowCfg.items.push(this.field);
		
		xn.components.PopupEditor.superclass.constructor.call(this, config);
	},

	startEdit: function(el, value) {
		if (this.editing) {
			this.completeEdit();
		}

		if (!this.editorWindow) {
			this.editorWindow = new Ext.Window(this.windowCfg);
		}

		this.boundEl = Ext.get(el);
		var v = value !== undefined ? value : this.boundEl.dom.innerHTML;

		if (this.fireEvent("beforestartedit", this, this.boundEl, v) !== false) {
			this.startValue = v;
			this.field.reset();
			this.field.setValue(v);
			this.editing = true;
			this.editorWindow.show(this.boundEl);
		}
	},
	cancelEdit: function(remainVisible) {
		if (this.editing) {
			var v = this.field.getValue();
			this.field.setValue(this.startValue);
			this.hideEdit(remainVisible);
			this.fireEvent("canceledit", this, v, this.startValue);
		}
	},

	// private
	hideEdit: function(remainVisible) {
		if (remainVisible !== true) {
			this.editing = false;
			this.editorWindow.hide();
		}
	},
	
	completeEdit: function(remainVisible) {
		if (!this.editing) {
			return;
		}
		// Assert combo values first
		if (this.field.assertValue) {
			this.field.assertValue();
		}
		var v = this.field.getValue();
		if (!this.field.isValid()) {
			if (this.revertInvalid !== false) {
				this.cancelEdit(remainVisible);
			}
			return;
		}
		if (String(v) === String(this.startValue) && this.ignoreNoChange) {
			this.hideEdit(remainVisible);
			return;
		}
		if (this.fireEvent("beforecomplete", this, v, this.startValue) !== false) {
			v = this.field.getValue();
			if (this.updateEl && this.boundEl) {
				this.boundEl.update(v);
			}
			this.hideEdit(remainVisible);
			this.fireEvent("complete", this, v, this.startValue);
		}
	},

	realign: function(autoSize) {
		if (null != this.editorWindow) {
			this.editorWindow.center();
		}
	}
});

Ext.reg('popupeditor', xn.components.PopupEditor);
