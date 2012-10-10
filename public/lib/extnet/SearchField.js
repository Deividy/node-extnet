
Ext.namespace('xn.components');

xn.components.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
	validationEvent: false,
	validateOnBlur: false,
	trigger1Class: 'x-form-clear-trigger',
	trigger2Class: 'x-form-search-trigger',
	hideTrigger1: true,
	width: 180,
	hasSearch: false,
	autoFilter: true,
	autoFilterBuffer: 500,
	minFilterLength: 3,

	initComponent: function () {

		this.enableKeyEvents = this.autoFilter;

		xn.components.SearchField.superclass.initComponent.call(this);
		this.on('specialkey', function (f, e) {
			if (e.getKey() == e.ENTER) {
				this.onTrigger2Click();
			}
		}, this);

		if (this.autoFilter) {
			this.on({
				'keyup': {
					fn: this.onTrigger2Click,
					scope: this,
					buffer: this.autoFilterBuffer
				}
			});
		}
	},

	onTrigger1Click: function () {
		this.clearFilter(true);
	},

	onTrigger2Click: function () {
		if (!this.prepareForFiltering()) {
			return;
		}

		this.store.filterBy(this.filter, this);

		this.hasSearch = true;
		this.triggers[0].show();
		this.focus();
	},

	clearFilter: function (reset) {
		if (!this.hasSearch) {
			return;
		}
		this.store.clearFilter();
		this.store.lastFilter = null;
		this.triggers[0].hide();
		this.hasSearch = false;
		if (reset) {
			this.reset();
		}
		this.focus();
	},

	prepareForFiltering: function () {
		this.searchRegExp = null;
		this.searchField = null;

		var query = this.getRawValue().trim();

		if (!query || query.length < this.minFilterLength) {
			this.clearFilter();
			return false;
		}

		var fieldValuePairRegExp = new RegExp('(.+):\s*(.*)', 'i');
		var kvp = fieldValuePairRegExp.exec(query);
		if (kvp != null) {
			this.searchField = kvp[1].trim().toLowerCase();
			query = kvp[2];
		}

		this.searchRegExp = query ? new RegExp(query, "i") : null;

		var res = this.searchRegExp !== null;
		if (res) {
			this.store.lastFilter = this.filter.createDelegate(this);
		}
		return res;
	},

	filter: function (r) {
		if (!this.searchRegExp) {
			return true;
		}

		for (var prop in r.data) {
			if (this.searchField !== null && prop.toLowerCase() != this.searchField) {
				continue;
			}

			var v = r.data[prop];

			if (v === null) {
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

Ext.reg('xnSearchField', xn.components.SearchField);

xn.components.RemoteSearchField = Ext.extend(xn.components.SearchField, {
	onTrigger2Click: function () {
		if (!this.prepareForFiltering()) {
			return;
		}

		Ext.apply(this.store.baseParams, {
			searchField: this.searchField,
			query: this.searchRegExp
		});

		this.store.load(this.getPagingParams());

		this.hasSearch = true;
		this.triggers[0].show();
		this.focus();
	},
	
	clearFilter: function (reset) {
		if (!this.hasSearch) {
			return;
		}

		Ext.apply(this.store.baseParams, { query: null, searchField: null });
		this.store.load(this.getPagingParams());
		this.triggers[0].hide();
		this.hasSearch = false;
		if (reset) {
			this.reset();
		}
		this.focus();
	},

	prepareForFiltering: function () {
		this.searchRegExp = null;
		this.searchField = null;

		var query = this.getRawValue().trim();

		if (!query || query.length < this.minFilterLength) {
			this.clearFilter();
			return false;
		}

		var fieldValuePairRegExp = new RegExp('(.+):\s*(.*)', 'i');
		var kvp = fieldValuePairRegExp.exec(query);
		if (kvp != null) {
			this.searchField = kvp[1].trim().toLowerCase();
			query = kvp[2];
		}

		this.searchRegExp = query;

		return this.searchRegExp !== null;
	},
	
	getPagingParams: function () {
		var o = null;
		var lastOptions = this.store.lastOptions;
		if (lastOptions && lastOptions.params && Ext.isDefined(lastOptions.params.limit)) {
			o = {
				params: {
					limit: lastOptions.params.limit,
					start: 0
				}
			};
		}
		return o;
	}	
});

Ext.reg('xnRemoteSearchField', xn.components.RemoteSearchField);