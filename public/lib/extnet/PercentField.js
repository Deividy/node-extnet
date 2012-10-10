
Ext.form.PercentField = Ext.extend(Ext.form.NumberField, {

	allowNegative: true,

	minValue: 0,
	
	maxValue: 100,
	
	decimalPrecision: 2,

	baseChars: "0123456789%",

	getValue: function () {
		var v = Ext.form.PercentField.superclass.getValue.call(this);
		if (Ext.isNumber(v) && this.rendered) {
			v = v / 100;
		}
		return v;
	},
	setValue: function (v) {
		v = Ext.isNumber(v) ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
		v = isNaN(v) ? 0 : v * 100;
		v = this.fixPrecision(v);
		v = Ext.isNumber(v) ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
		v = isNaN(v) ? '' : String(v).replace(".", this.decimalSeparator) + ' %';
		return Ext.form.NumberField.superclass.setValue.call(this, v);
	},
	processValue: function (v) {
		return v.replace('%', '').trim();
	},

	beforeBlur: function () {
		var v = parseFloat(String(this.getRawValue()).replace(this.decimalSeparator, "."));
		v = isNaN(v) ? 0 : v / 100;
		this.setValue(v);
	}
});

Ext.reg('percentfield', Ext.form.PercentField);
