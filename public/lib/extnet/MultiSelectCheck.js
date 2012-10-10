
Ext.ns('xn.components');

xn.components.MultiSelectCheck = Ext.extend(Ext.form.ComboBox, {
	checkField: 'checked',
	separator: ', ',
	checkAllIndex: false,
	checkNoneIndex: false,

	constructor: function(config) {
		config = config || {};
		config.listeners = config.listeners || {};
		Ext.applyIf(config.listeners, {
			scope: this,
			beforequery: this.onBeforeQuery,
			blur: this.onRealBlur
		});
		xn.components.MultiSelectCheck.superclass.constructor.call(this, config);
	},

	initComponent: function() {

		// remove selection from input field
		this.onLoad = this.onLoad.createSequence(function() {
			if (this.el) {
				var v = this.el.dom.value;
				this.el.dom.value = '';
				this.el.dom.value = v;
			}
		});

		xn.components.MultiSelectCheck.superclass.initComponent.apply(this, arguments);

		// template with checkbox

		var itemId = this.getId() + '-item-{#}';
		var itemLabel = '{' + (this.displayField || 'text') + ':htmlEncode}';
		var itemChecked = '{[values.' + this.checkField + '?"checked":""' + ']}';

		this.tpl = [
			 '<tpl for=".">',
			 	'<div class="x-combo-list-item x-form-check-wrap">',
			 		'<input type="checkbox" name="' + itemId + '" id="' + itemId + '" autocomplete="off" ' + itemChecked + ' class=" x-form-checkbox x-form-field">',
			 		'<label class="x-form-cb-label" for="' + itemId + '">' + itemLabel + '</label>',
				'</div>',
			 '</tpl>'
		];
	},

	initEvents: function() {
		xn.components.MultiSelectCheck.superclass.initEvents.apply(this, arguments);

		// disable default tab handling - does no good
		this.keyNav.tab = false;

	},

	clearValue: function() {
		this.value = '';
		this.setRawValue(this.value);
		this.store.clearFilter();
		this.store.each(function(r) {
			r.set(this.checkField, false);
		}, this);
		if (this.hiddenField) {
			this.hiddenField.value = '';
		}
		this.applyEmptyText();
	},

	getCheckedDisplay: function() {
		var re = new RegExp(this.separator, "g");
		return this.getCheckedValue(this.displayField).replace(re, this.separator + ' ');
	},

	getCheckedValue: function(field) {
		field = field || this.valueField;
		var c = [];

		// store may be filtered so get all records
		var snapshot = this.store.snapshot || this.store.data;

		snapshot.each(function(r) {
			if (r.get(this.checkField)) {
				c.push(r.get(field));
			}
		}, this);

		return c.join(this.separator);
	},

	onBeforeQuery: function(qe) {
		qe.query = qe.query.replace(new RegExp(RegExp.escape(this.getCheckedDisplay()) + '[ ' + this.separator + ']*'), '');
	},

	onRealBlur: function() {
		this.list.hide();
		var rv = this.getRawValue();
		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
		var va = [];
		var snapshot = this.store.snapshot || this.store.data;

		// iterate through raw values and records and check/uncheck items
		Ext.each(rva, function(v) {
			snapshot.each(function(r) {
				if (v === r.get(this.displayField)) {
					va.push(r.get(this.valueField));
				}
			}, this);
		}, this);
		this.setValue(va.join(this.separator));
		this.store.clearFilter();
	},

	onSelect: function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {

			if (this.checkNoneIndex !== false) {
				if (index == this.checkNoneIndex) {
					this.clearValue();
				} else {
					this.store.getAt(this.checkNoneIndex).set(this.checkField, false);
				}
			}

			if (this.checkAllIndex !== false && index == this.checkAllIndex) {
				this.store.each(function(r, i) {
					r.set(this.checkField, !((i == this.checkAllIndex) || (this.checkNoneIndex !== false && i == this.checkNoneIndex)));
				}, this);
			} else {
				// toggle checked field
				record.set(this.checkField, !record.get(this.checkField));
			}

			// display full list
			if (this.store.isFiltered()) {
				this.doQuery(this.allQuery);
			}

			// set (update) value and fire event
			this.setValue(this.getCheckedValue());
			this.fireEvent('select', this, record, index);
		}
	},

	setValue: function(v) {
		if (v) {
			v = '' + v;
			if (this.valueField) {
				this.store.clearFilter();
				this.store.each(function(r) {
					var checked = !(!v.match(
						 '(^|' + this.separator + ')' + RegExp.escape(r.get(this.valueField))
						+ '(' + this.separator + '|$)'))
					;

					r.set(this.checkField, checked);
				}, this);
				this.value = this.getCheckedValue();
				this.setRawValue(this.getCheckedDisplay());
				if (this.hiddenField) {
					this.hiddenField.value = this.value;
				}
			}
			else {
				this.value = v;
				this.setRawValue(v);
				if (this.hiddenField) {
					this.hiddenField.value = v;
				}
			}
			if (this.el) {
				this.el.removeClass(this.emptyClass);
			}
		}
		else {
			this.clearValue();
		}
	},

	assertValue: function() {
		return; // prevent combox's assertValue
	}
});

Ext.reg('multiselectcheck', xn.components.MultiSelectCheck); 
