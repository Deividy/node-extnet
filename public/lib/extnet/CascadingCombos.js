
xn.CascadingCombos = Ext.extend(Object, {
	fields: ['name'],

	constructor: function (root) {
		this.root = root;
	},

	setupCascadingCombos: function (cntCombos, comboConfigs) {
		this.combos = [];
		this.depth = cntCombos;

		for (var i = 0; i < cntCombos; i++) {
			var config = {
				cascading: { level: i },
				disabled: i > 0
			};

			if (Ext.isObject(comboConfigs)) {
				Ext.apply(config, comboConfigs);
			} else if (Ext.isArray(comboConfigs) && comboConfigs[i]) {
				Ext.apply(config, comboConfigs[i]);
			}

			var c = this.instantiateCombo(config);
			c.on('select', this.cascadingComboSelect, this);
			this.combos.push(c);
		}

		this.loadCascadingCombo(this.root, this.combos[0]);
		return this.combos;
	},

	instantiateCombo: function (config) {
		Ext.applyIf(config, {
			shadow: false,
			forceSelection: true,
			triggerAction: 'all',
			mode: 'local', valueField: this.fields[0], displayField: (this.fields[1] || this.fields[0]), editable: false,


			store: new Ext.data.JsonStore({
				autoDestroy: true,
				data: [],
				fields: this.fields, idProperty: this.fields[0]
			})
		});

		return new Ext.form.ComboBox(config);
	},

	setInitialValues: function (initialValues) {
		if (!Ext.isArray(initialValues) || initialValues.length != this.combos.length) {
			throw "Number of initial values doesn't match depth of cascading combos";
		}
		this.cascadingComboSelect(this.combos[0], true, initialValues);
	},

	cascadingComboSelect: function (combo, isBulk, initialValues) {
		var cascading = combo.cascading;
		var comboArray = this.combos;
		var parentNode = cascading.parentNode;
		var hasInitialValues = Ext.isArray(initialValues) && initialValues.length == comboArray.length;
		var nextLevel = cascading.level + 1;

		if (nextLevel == comboArray.length) {
			if (isBulk === false) {
				combo.fireEvent('select', combo);
			}
			return;
		}

		for (var i = nextLevel; i < comboArray.length; i++) {
			comboArray[i].cascading.parentNode = null;
			comboArray[i].disable();
			comboArray[i].clearValue();
			comboArray[i].clearInvalid();
		}

		var selectedNode = this.getChildNode(parentNode, hasInitialValues ? initialValues[cascading.level] : combo.getValue());
		if (!selectedNode) {
			return;
		}

		var nextCombo = comboArray[nextLevel];

		var nextValue = this.loadCascadingCombo(selectedNode, nextCombo, hasInitialValues ? initialValues[nextLevel] : undefined);

		if (nextValue) {
			nextCombo.setValue(nextValue);
			this.cascadingComboSelect(nextCombo, isBulk === true, initialValues);
		} else if (isBulk !== true) {
			nextCombo.onTriggerClick();
		}
	},

	getChildNode: function (parentNode, value) {
		return parentNode[value];
	},

	loadCascadingCombo: function (parentNode, combo, initialValue) {
		combo.cascading.parentNode = parentNode;

		var nextValue = this.doComboLoad(combo, parentNode, initialValue);

		combo.enable();
		return nextValue;
	},

	doComboLoad: function (combo, parentNode, initialValue) {
		var data = xn.getOwnProperties(parentNode);
		combo.store.loadData(data.select(function (d) { return { name: d }; }));
		if (initialValue) {
			var i = data.indexOf(initialValue);
			return i >= 0 ? data[i] : null;
		}
		return data.length == 1 ? data[0] : null;
	}
});

xn.CascadingSelects = Ext.extend(xn.CascadingCombos, {
	doComboLoad: function (combo, parentNode, initialValue) {
		var data = xn.getOwnProperties(parentNode);
		combo.loadData(data);
		if (initialValue) {
			var i = data.indexOf(initialValue);
			return i >= 0 ? data[i] : null;
		}		
		return data.length == 1 ? data[0] : null;
	},

	instantiateCombo: function (config) {
		return new ExtNet.Select(config);
	}
});
