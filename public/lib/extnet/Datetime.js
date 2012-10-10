
Ext.form.DateTime = Ext.extend(Ext.form.Field, {
	dateValidator: null,
	defaultAutoCreate: {
		tag: 'input',
		type: 'hidden'
	},
	dtSeparator: ' ',
	hiddenFormat: 'Y-m-d H:i:s',
	otherToNow: true,
	timePosition: 'right',
	timeValidator: null,
	timeWidth: 100,
	dateFormat: 'm/d/y',
	timeFormat: 'g:i A',

	initComponent: function () {
		// call parent initComponent
		Ext.form.DateTime.superclass.initComponent.call(this);

		// create DateField
		var dateConfig = Ext.apply({}, {
			id: this.id + '-date',
			format: this.dateFormat || Ext.form.DateField.prototype.format,
			width: this.timeWidth,
			selectOnFocus: this.selectOnFocus,
			validator: this.dateValidator,
			listeners: {
				blur: {
					scope: this,
					fn: this.onBlur
				},
				focus: {
					scope: this,
					fn: this.onFocus
				}
			}
		}, this.dateConfig);
		this.df = new Ext.form.DateField(dateConfig);
		this.df.ownerCt = this;
		delete (this.dateFormat);

		// create TimeField
		var timeConfig = Ext.apply({}, {
			id: this.id + '-time',
			format: this.timeFormat || Ext.form.TimeField.prototype.format,
			width: this.timeWidth,
			selectOnFocus: this.selectOnFocus,
			validator: this.timeValidator,
			listeners: {
				blur: {
					scope: this,
					fn: this.onBlur
				},
				focus: {
					scope: this,
					fn: this.onFocus
				}
			}
		}, this.timeConfig);
		this.tf = new Ext.form.TimeField(timeConfig);
		this.tf.ownerCt = this;
		delete (this.timeFormat);

		// relay events
		this.relayEvents(this.df, ['focus', 'specialkey', 'invalid', 'valid']);
		this.relayEvents(this.tf, ['focus', 'specialkey', 'invalid', 'valid']);

		this.on('specialkey', this.onSpecialKey, this);

	},

	onRender: function (ct, position) {
		if (this.isRendered) {
			return;
		}

		Ext.form.DateTime.superclass.onRender.call(this, ct, position);

		var t;
		if ('below' === this.timePosition || 'bellow' === this.timePosition) {
			t = Ext.DomHelper.append(ct, {
				tag: 'table',
				style: 'border-collapse:collapse',
				children: [{
					tag: 'tr',
					children: [{
						tag: 'td',
						style: 'padding-bottom:1px',
						cls: 'ux-datetime-date'
					}]
				}, {
					tag: 'tr',
					children: [{
						tag: 'td',
						cls: 'ux-datetime-time'
					}]
				}]
			}, true);
		}
		else {
			t = Ext.DomHelper.append(ct, {
				tag: 'table',
				style: 'border-collapse:collapse',
				children: [{
					tag: 'tr',
					children: [{
						tag: 'td',
						style: 'padding-right:4px',
						cls: 'ux-datetime-date'
					}, {
						tag: 'td',
						cls: 'ux-datetime-time'
					}]
				}]
			}, true);
		}

		this.tableEl = t;
		this.wrap = t.wrap({
			cls: 'x-form-field-wrap'
		});

		this.wrap.on("mousedown", this.onMouseDown, this, {
			delay: 10
		});

		this.df.render(t.child('td.ux-datetime-date'));
		this.tf.render(t.child('td.ux-datetime-time'));

		// workaround for IE trigger misalignment bug
		// see http://extjs.com/forum/showthread.php?p=341075#post341075
		//        if(Ext.isIE && Ext.isStrict) {
		//            t.select('input').applyStyles({top:0});
		//        }

		this.df.el.swallowEvent(['keydown', 'keypress']);
		this.tf.el.swallowEvent(['keydown', 'keypress']);

		if ('side' === this.msgTarget) {
			var elp = this.el.findParent('.x-form-element', 10, true);
			if (elp) {
				this.errorIcon = elp.createChild({
					cls: 'x-form-invalid-icon'
				});
			}

			var o = {
				errorIcon: this.errorIcon,
				msgTarget: 'side',
				alignErrorIcon: this.alignErrorIcon.createDelegate(this)
			};
			Ext.apply(this.df, o);
			Ext.apply(this.tf, o);
		}

		this.el.dom.name = this.hiddenName || this.name || this.id;

		this.df.el.dom.removeAttribute("name");
		this.tf.el.dom.removeAttribute("name");

		this.isRendered = true;

		this.updateHidden();

	},

	adjustSize: Ext.BoxComponent.prototype.adjustSize,

	alignErrorIcon: function () {
		this.errorIcon.alignTo(this.tableEl, 'tl-tr', [2, 0]);
	},

	initDateValue: function () {
		this.dateValue = this.otherToNow ? new Date() : new Date(1970, 0, 1, 0, 0, 0);
	},

	clearInvalid: function () {
		this.df.clearInvalid();
		this.tf.clearInvalid();
		Ext.form.DateTime.superclass.clearInvalid.apply(this, arguments);
	},

	markInvalid: function () {
		this.df.markInvalid('');
		this.tf.markInvalid('');
		Ext.form.DateTime.superclass.markInvalid.apply(this, arguments);
	},

	beforeDestroy: function () {
		if (this.isRendered) {
			this.wrap.removeAllListeners();
			this.wrap.remove();
			this.tableEl.remove();
			this.df.destroy();
			this.tf.destroy();
		}
	},

	disable: function () {
		if (this.isRendered) {
			this.df.disabled = this.disabled;
			this.df.onDisable();
			this.tf.onDisable();
		}
		this.disabled = true;
		this.df.disabled = true;
		this.tf.disabled = true;
		this.fireEvent("disable", this);
		return this;
	},

	enable: function () {
		if (this.rendered) {
			this.df.onEnable();
			this.tf.onEnable();
		}
		this.disabled = false;
		this.df.disabled = false;
		this.tf.disabled = false;
		this.fireEvent("enable", this);
		return this;
	},

	focus: function () {
		this.df.focus();
	},

	getPositionEl: function () {
		return this.wrap;
	},

	getResizeEl: function () {
		return this.wrap;
	},

	getValue: function () {
		return this.dateValue ? new Date(this.dateValue) : '';
	},

	isValid: function () {
		return this.df.isValid() && this.tf.isValid();
	},

	isVisible: function () {
		return this.df.rendered && this.df.getActionEl().isVisible();
	},

	onBlur: function (f) {
		if (this.wrapClick) {
			f.focus();
			this.wrapClick = false;
		}


		if (f === this.df) {
			this.updateDate();
		}
		else {
			this.updateTime();
		}
		this.updateHidden();

		this.validate();

		(function () {
			if (!this.df.hasFocus && !this.tf.hasFocus) {
				var v = this.getValue();
				if (String(v) !== String(this.startValue)) {
					this.fireEvent("change", this, v, this.startValue);
				}
				this.hasFocus = false;
				this.fireEvent('blur', this);
			}
		}).defer(100, this);

	},

	onFocus: function () {
		if (!this.hasFocus) {
			this.hasFocus = true;
			this.startValue = this.getValue();
			this.fireEvent("focus", this);
		}
	},

	onMouseDown: function (e) {
		if (!this.disabled) {
			this.wrapClick = 'td' === e.target.nodeName.toLowerCase();
		}
	},

	onSpecialKey: function (t, e) {
		var key = e.getKey();
		if (key === e.TAB) {
			if (t === this.df && !e.shiftKey) {
				e.stopEvent();
				this.tf.focus();
			}
			if (t === this.tf && e.shiftKey) {
				e.stopEvent();
				this.df.focus();
			}
			this.updateValue();
		}

		if (key === e.ENTER) {
			this.updateValue();
		}

	},

	reset: function () {
		this.df.setValue(this.originalValue);
		this.tf.setValue(this.originalValue);
	},

	setDate: function (date) {
		this.df.setValue(date);
	},

	setTime: function (date) {
		this.tf.setValue(date);
	},

	setSize: function (w, h) {
		if (!w) {
			return;
		}
		if ('below' === this.timePosition) {
			this.df.setSize(w, h);
			this.tf.setSize(w, h);
			if (Ext.isIE) {
				this.df.el.up('td').setWidth(w);
				this.tf.el.up('td').setWidth(w);
			}
		}
		else {
			this.df.setSize(w - this.timeWidth - 4, h);
			this.tf.setSize(this.timeWidth, h);

			if (Ext.isIE) {
				this.df.el.up('td').setWidth(w - this.timeWidth - 4);
				this.tf.el.up('td').setWidth(this.timeWidth);
			}
		}
	},

	setValue: function (val) {
		if (!val && true === this.emptyToNow) {
			this.setValue(new Date());
			return;
		}
		else
			if (!val) {
				this.setDate('');
				this.setTime('');
				this.updateValue();
				return;
			}
		if ('number' === typeof val) {
			val = new Date(val);
		}
		else
			if ('string' === typeof val && this.hiddenFormat) {
				val = Date.parseDate(val, this.hiddenFormat);
			}
		val = val ? val : new Date(1970, 0, 1, 0, 0, 0);
		var da;
		if (val instanceof Date) {
			this.setDate(val);
			this.setTime(val);
			this.dateValue = new Date(Ext.isIE ? val.getTime() : val);
		}
		else {
			da = val.split(this.dtSeparator);
			this.setDate(da[0]);
			if (da[1]) {
				if (da[2]) {
					da[1] += da[2];
				}
				this.setTime(da[1]);
			}
		}
		this.updateValue();
	},

	setVisible: function (visible) {
		if (visible) {
			this.df.show();
			this.tf.show();
		}
		else {
			this.df.hide();
			this.tf.hide();
		}
		return this;
	},

	show: function () {
		return this.setVisible(true);
	},

	hide: function () {
		return this.setVisible(false);
	},

	updateDate: function () {
		var d = this.df.getValue();
		if (d) {
			if (!(this.dateValue instanceof Date)) {
				this.initDateValue();
				if (!this.tf.getValue()) {
					this.setTime(this.dateValue);
				}
			}
			this.dateValue.setMonth(0);
			this.dateValue.setFullYear(d.getFullYear());
			this.dateValue.setMonth(d.getMonth(), d.getDate());
		}
		else {
			this.dateValue = '';
			this.setTime('');
		}
	},

	updateTime: function () {
		var t = this.tf.getValue();
		if (t && !(t instanceof Date)) {
			t = Date.parseDate(t, this.tf.format);
		}
		if (t && !this.df.getValue()) {
			this.initDateValue();
			this.setDate(this.dateValue);
		}
		if (this.dateValue instanceof Date) {
			if (t) {
				this.dateValue.setHours(t.getHours());
				this.dateValue.setMinutes(t.getMinutes());
				this.dateValue.setSeconds(t.getSeconds());
			}
			else {
				this.dateValue.setHours(0);
				this.dateValue.setMinutes(0);
				this.dateValue.setSeconds(0);
			}
		}
	},

	updateHidden: function () {
		if (this.isRendered) {
			var value = this.dateValue instanceof Date ? this.dateValue.format(this.hiddenFormat) : '';
			this.el.dom.value = value;
		}
	},

	updateValue: function () {
		this.updateDate();
		this.updateTime();
		this.updateHidden();

		return;
	},

	getErrors: function (value) {
		var errors = [];
		value = Ext.isDefined(value) ? value : this.processValue(this.getRawValue());
		var fields = [this.df, this.tf];

		for (var i = 0; i < 2; i++) {
			var f = fields[i];
			var errors = f.getErrors(f.processValue(f.getRawValue()));
			if (errors[0] != undefined) {
				return errors;
			}
		}

		if (Ext.isFunction(this.validator)) {
			var msg = this.validator(value);
			if (msg !== true) {
				errors.push(msg);
			}
		}
		return errors;
	},

	renderer: function (field) {
		var format = field.editor.dateFormat || Ext.DateTime.prototype.dateFormat;
		format += ' ' + (field.editor.timeFormat || Ext.form.DateTime.prototype.timeFormat);
		var renderer = function (val) {
			var retval = Ext.util.Format.date(val, format);
			return retval;
		};
		return renderer;
	},
	setReadOnly: function (readOnly) {
		this.df.setReadOnly(readOnly);
		this.tf.setReadOnly(readOnly);
		this.readOnly = readOnly;
	}
}); 

Ext.reg('xdatetime', Ext.form.DateTime);
