

Ext.log = function () {
	if (Ext.debug && window.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

if (Ext.isDefined(Ext.LoadMask)) {
	Ext.override(Ext.LoadMask, {
		onLoad: function () {
			this.el.unmask(this.removeMask);
			if (this.removeMask) {
				this.destroy();
			}
		}
	});
}

Ext.override(Ext.form.Field, {
	setLabel: function (text) {
		if (!this.rendered) {
			this.fieldLabel = text;
			return;
		}

		var r = this.getEl().up('div.x-form-item');
		var label = (this.labelSeparator || this.ownerCt.labelSeparator || this.ownerCt.layout.labelSeparator || '');
		r.dom.firstChild.firstChild.nodeValue = text + label;
	},

	hideWithLabel: function () {
		this.hide();
		if (this.el) {
			this.el.up('.x-form-item').addClass('x-hide-' + this.hideMode);
		}
	},

	showWithLabel: function () {
		this.show();
		if (this.el) {
			this.el.up('.x-form-item').removeClass('x-hide-' + this.hideMode);
		}
	}
});


Ext.override(Ext.form.TextField, {
	filterKeys: function (e) {
		if (e.ctrlKey) {
			return;
		}
		var k = e.getKey();
		if ((e.isNavKeyPress && e.isNavKeyPress()) || k == e.BACKSPACE || (k == e.DELETE && e.button == -1)) {
			return;
		}
		var cc = String.fromCharCode(e.getCharCode());
		if (!Ext.isGecko && e.isSpecialKey() && !cc) {
			return;
		}
		if (!this.maskRe.test(cc)) {
			e.stopEvent();
		}
	}
});

Ext.override(Ext.PagingToolbar, {
	bindStore: function (store, initial) {
		var doLoad;
		if (!initial && this.store) {
			if (store !== this.store && this.store.autoDestroy) {
				this.store.destroy();
			} else {
				this.store.un('beforeload', this.beforeLoad, this);
				this.store.un('datachanged', this.onDataChanged, this);
				this.store.un('exception', this.onLoadError, this);
			}
			if (!store) {
				this.store = null;
			}
		}
		if (store) {
			store = Ext.StoreMgr.lookup(store);
			store.xnIsPaged = true;
			store.on({
				scope: this,
				beforeload: this.beforeLoad,
				datachanged: this.onDataChanged,
				exception: this.onLoadError
			});
			doLoad = true;
		}
		this.store = store;
		if (doLoad) {
			this.onLoad(store, null, {});
		}
	},

	onDataChanged: function (store) {
		if (!store.lastOptions) {
			var p = this.getParams();
			last = {};
			last[p.start] = 0;
			last[p.limit] = this.pageSize;
			store.lastOptions = { params: last };
		}

		this.onLoad(store, null, store.lastOptions);
		var d = this.getPageData(), c = store.getCount();

		if (d.activePage > d.pages) {
			this.movePrevious();
		} else if (d.activePage < d.pages && c < this.pageSize) {
			this.changePage(d.activePage);
		}
	}
});

Ext.override(Ext.form.NumberField, {
	emptyValue: 0,

	fixPrecision: function (value) {
		var nan = isNaN(value);

		if (!this.allowDecimals || this.decimalPrecision == -1 || nan) {
			return Ext.num(value, this.emptyValue);
		}

		return parseFloat(parseFloat(Ext.num(value, this.emptyValue)).toFixed(this.decimalPrecision));
	},

	parseValue: function (value) {
		value = parseFloat(String(value).replace(this.decimalSeparator, "."));
		return Ext.num(value, this.emptyValue);
	}
});

Ext.Element.addMethods(
	function () {
		var XMASKED = "x-masked",
			XMASKEDRELATIVE = "x-masked-relative",
			data = Ext.Element.data; 

		return {
			unmask : function(){
				var me = this,
					dom = me.dom,
					mask = data(dom, 'mask'),
					maskMsg = data(dom, 'maskMsg');
				if(mask){
					if(maskMsg){
						maskMsg.remove();
						data(dom, 'maskMsg', undefined);
					}
					mask.remove();
					data(dom, 'mask', undefined);
				}
				me.removeClass([XMASKED, XMASKEDRELATIVE]);
			}
		};
} ()
);


if (Ext.isMultiTouchDevice) {
	Ext.form.TimeField = Ext.extend(xn.Select, {
		minValue: undefined,
		maxValue: undefined,
		minText: "The time in this field must be equal to or after {0}",
		maxText: "The time in this field must be equal to or before {0}",
		invalidText: "{0} is not a valid time",
		format: "g:i A",
		altFormats: "g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H|gi a|hi a|giA|hiA|gi A|hi A",
		increment: 15,
		mode: 'local',
		triggerAction: 'all',
		typeAhead: false,
		initDate: '1/1/2008',
		initDateFormat: 'j/n/Y',
		initComponent: function () {
			if (Ext.isDefined(this.minValue)) {
				this.setMinValue(this.minValue, true);
			}
			if (Ext.isDefined(this.maxValue)) {
				this.setMaxValue(this.maxValue, true);
			}
			if (!this.store) {
				this.generateStore(true);
			}
			Ext.form.TimeField.superclass.initComponent.call(this);
		},
		setMinValue: function (value, /* private */initial) {
			this.setLimit(value, true, initial);
			return this;
		},
		setMaxValue: function (value, /* private */initial) {
			this.setLimit(value, false, initial);
			return this;
		},

		generateStore: function (initial) {
			var min = this.minValue || new Date(this.initDate).clearTime(),
            max = this.maxValue || new Date(this.initDate).clearTime().add('mi', (24 * 60) - 1),
            times = [];

			while (min <= max) {
				times.push(min.dateFormat(this.format));
				min = min.add('mi', this.increment);
			}
			this.bindStore(times, initial);
		},

		// private
		setLimit: function (value, isMin, initial) {
			var d;
			if (Ext.isString(value)) {
				d = this.parseDate(value);
			} else if (Ext.isDate(value)) {
				d = value;
			}
			if (d) {
				var val = new Date(this.initDate).clearTime();
				val.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
				this[isMin ? 'minValue' : 'maxValue'] = val;
				if (!initial) {
					this.generateStore();
				}
			}
		},

		// inherited docs
		getValue: function () {
			var v = Ext.form.TimeField.superclass.getValue.call(this);
			return this.formatDate(this.parseDate(v)) || '';
		},

		// inherited docs
		setValue: function (value) {
			return Ext.form.TimeField.superclass.setValue.call(this, this.formatDate(this.parseDate(value)));
		},

		// private overrides
		validateValue: Ext.form.DateField.prototype.validateValue,

		formatDate: Ext.form.DateField.prototype.formatDate,

		parseDate: function (value) {
			if (!value || Ext.isDate(value)) {
				return value;
			}

			var id = this.initDate + ' ',
            idf = this.initDateFormat + ' ',
            v = Date.parseDate(id + value, idf + this.format), // *** handle DST. note: this.format is a TIME-only format
            af = this.altFormats;

			if (!v && af) {
				if (!this.altFormatsArray) {
					this.altFormatsArray = af.split("|");
				}
				for (var i = 0, afa = this.altFormatsArray, len = afa.length; i < len && !v; i++) {
					v = Date.parseDate(id + value, idf + afa[i]);
				}
			}

			return v;
		}
	});

	Ext.reg('timefield', Ext.form.TimeField);
}

if (Ext.isDefined(Ext.form.BasicForm)) {
	Ext.override(Ext.form.BasicForm, {
		getValidFieldValues : function(preventMark){
			var o = {},
				n,
				key,
				val;
			this.items.each(function(f) {
				if (!f.disabled && f.isValid(preventMark)) {
					n = f.getName();
					key = o[n];
					val = f.getValue();

					if(Ext.isDefined(key)){
						if(Ext.isArray(key)){
							o[n].push(val);
						}else{
							o[n] = [key, val];
						}
					}else{
						o[n] = val;
					}
				}
			});
			return o;
		}	
	});
}

Ext.apply(Ext, {
	downloadFile: function(url) {
		try {
			Ext.destroy(Ext.get('downloadIframe'));
		}
		catch (e) { }
		Ext.DomHelper.append(Ext.getBody(), {
			tag: 'iframe',
			id: 'downloadIframe',
			frameBorder: 0,
			width: 0,
			height: 0,
			css: 'display:none;visibility:hidden;height:0px;',
			src: url
		});	
	}
});

Ext.applyIf(Math, {
	roundTo: function (number, places) {
		var p = Math.pow(10, places),
			v = number || 0;
		return Math.round(p*v)/p;
	}
});