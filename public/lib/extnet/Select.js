
// MUST: refactor this guy. It needs some help.
xn.Select = Ext.extend(Ext.form.Field, {
	allowBlank: true,
	blankText: 'This field is required',
	validator: null,
	_values: [],

	initComponent: function () {
		if (this.dummyOption === undefined) {
			this.dummyOption = new Option('', -1);
		}

		Ext.form.TextField.superclass.initComponent.apply(this, arguments);
		this.addEvents('select');
	},

	initEvents: function () {
		Ext.form.TextField.superclass.initEvents.call(this);
		this.mon(this.el, 'change', this.onSelect, this);
	},

	onSelect: function () {
		this.fireEvent('select', this, this.getValue());
	},

	onTriggerClick: function () { },

	triggerBlur: function () {
		this.onBlur();
	},

	clearValue: function () {
		if (0 == this.el.dom.options.length) {
			return;
		}

		this.setSelectedIndex(0);
	},

	onDisable: function () {
		Ext.form.TextField.superclass.onDisable.call(this);
		if (Ext.isIE) {
			this.el.dom.unselectable = 'on';
		}
	},

	//private
	onEnable: function () {
		Ext.form.TextField.superclass.onEnable.call(this);
		if (Ext.isIE) {
			this.el.dom.unselectable = '';
		}
	},

	clearOptions: function () {
		var dom = this.el.dom;
		while (dom.options.length > 0) {
			dom.remove(0);
		}
		this._values = [];
	},

	defaultAutoCreate: { tag: 'select' },

	setValue: function (v) {
		if (this.rendered) {
			for (i = this._values.length - 1; i >= 0; i--) {
				if (this._values[i] == v) {
					this.setSelectedIndex(i);
					break;
				}
			}
		} else {
			this.initialValue = v;
		}

		return this;
	},

	setSelectedIndex: function (i) {
		var dom = this.el.dom;
		dom.options[i].selected = true;
		dom.selectedIndex = i;
		this.value = this._values[i];
	},

	getErrors: function (value) {
		var errors = Ext.form.TextField.superclass.getErrors.apply(this, arguments);

		value = value || this.value;

		if (Ext.isFunction(this.validator)) {
			var msg = this.validator(value);
			if (msg !== true) {
				errors.push(msg);
			}
		}

		if (this.dummyOption && value == this.dummyOption.value) {
			if (this.allowBlank) {
				//if value is blank and allowBlank is true, there cannot be any additional errors
				return errors;
			} else {
				errors.push(this.blankText);
			}
		}

		return errors;
	},

	afterRender: function () {
		var options = this.options || this.initialConfig.options || this.store || this.initialConfig.store;

		if (options) {
			this.loadData(options);
		}
		if (Ext.isDefined(this.initialValue)) {
			this.setValue(this.initialValue);
			this.initialValue = null;
		}
		xn.Select.superclass.afterRender.call(this);
	},

	onDestroy: function () {
		if (this.validationTask) {
			this.validationTask.cancel();
			this.validationTask = null;
		}

		Ext.form.TextField.superclass.onDestroy.call(this);
	},

	loadData: function (options) {
		this.bindStore(options, 0);
	},

	bindStore: function (options, initial) {
		this.options = options;

		if (!this.rendered) {
			return;
		}

		this.clearOptions();

		var dom = this.el.dom;
		var offset = 0;
		if (this.dummyOption) {
			dom.options[0] = this.dummyOption;
			this._values[0] = this.dummyOption.value;
			offset++;
		}

		for (var i = 0; i < options.length; i++) {
			var o = options[i];
			var option = Ext.isObject(o) ? new Option(o.text, o.value) : Ext.isArray(o) && o.length == 2 ? new Option(o[1], o[0]) : new Option(o, o);
			dom.options[i + offset] = option;
			this._values[i + offset] = Ext.isObject(o) ? o.value : Ext.isArray(o) && o.length == 2 ? o[0] : o;
		}

		this.setSelectedIndex(initial < dom.options.length ? initial : 0);
	},
	setReadOnly: function (readOnly) {
		if (this.rendered) {
			if (readOnly) {
				this.el.dom.disabled = 'disabled';
			} else {
				if (Ext.isDefined(this.el.dom.disabled)) {
					this.el.dom.removeAttribute('disabled');
				}
			}
		}
		this.readOnly = readOnly;
	}
});

Ext.reg('select', xn.Select);
