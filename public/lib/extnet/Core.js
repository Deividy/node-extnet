
Ext.ns('ExtNet');

ExtNet.Util = ExtNet;
xn = ExtNet;
xnUtils = xn;

xn.trueFn = function() { return true; };
xn.falseFn = function() { return false; };

xn.handleException = function (proxy, type, action, options, response, arg) {
	var msgBoxConfig = {
		title: String.format('{0} Exception', type.toLowerCase().title()),
		msg: String.format('An unknown {0} Exception occured during {1} action with url {2}', type.toLowerCase().title(), action.toLowerCase(),proxy.url),
		icon: Ext.MessageBox.ERROR,
		buttons: Ext.Msg.OK
	};

	if (type == 'remote') {
		Ext.apply(msgBoxConfig,{
			msg: response.message
		});
	} else {
		var res = Ext.isDefined(response.responseText) ? Ext.decode(response.responseText) : false;
		Ext.apply(msgBoxConfig, {
			title: res ? String.format('Error {0}: {1}', response.status, response.statusText) : 'Invalid data returned from server',
			msg: res && Ext.isDefined(res.message) ? res.message : String.format(['The server returned an invalid response.', '<b>{0}:</b> <em>{1}</em>'].join('<br>'),response.status,response.statusText)
		});
	}

	Ext.Msg.show(msgBoxConfig);
};

xn.consts = {
	shortDateTime: 'm/d/Y g:i A',
	currency: '0,000.00',
	dateFormat: 'Y-m-d H:i'
};

Ext.applyIf(String.prototype, {
	splitNonEmpty: function (c, l) {
		return this.split(c, l).transform(String.prototype.trim).where(String.prototype.isGood);
	},

	isGood: function () {
		return this && this.trim();
	}
});

xn.comparer = function(a, b) {
	return a < b ? -1 : b < a ? 1 : 0;
};

xn.ensureArray = function(o) {
	if (Ext.isArray(o)) {
		return o;
	}

	if (o == null) {
		return [];
	}

	return [o];
};

xn.countOwnProperties = function(o) {
	var count = 0;
	for (k in o) {
		if (o.hasOwnProperty(k)) {
			count++;
		}
	}

	return count;
};

xn.withEachOwnProperty = function(o, f) {
	for (k in o) {
		if (o.hasOwnProperty(k)) {
			f(k, o[k]);
		}
	}
};

xn.getOwnProperties = function(o) {
	var p = [];
	for (k in o) {
		if (o.hasOwnProperty(k)) {
			p.push(k);
		}
	}

	return p;
};

xn.getValues = function(o, re) {
	var p = [];
	for (k in o) {
		if (o.hasOwnProperty(k) && re.test(k)) {
			p.push(o[k]);
		}
	}

	return p;
};

xn.deepEquals = function(o1, o2) {
	if ((o1 !== undefined) != (o2 !== undefined)) {
		return false;
	}

	if ((o1 !== null) != (o2 !== null)) {
		return false;
	}

	if (Ext.isPrimitive(o1) && Ext.isPrimitive(o2)) {
		return o1 === o2;
	}

	if (o1.constructor != o2.constructor) {
		return false;
	}

	if (o1.deepEquals) {
		return o1.deepEquals(o2);
	}

	var o1Properties = xn.getOwnProperties(o1);
	var o2Properties = xn.getOwnProperties(o2);

	if (o1Properties.length != o2Properties.length) {
		return false;
	}

	for (var i = 0; i < o1Properties.length; i++) {
		var p = o1Properties[i];
		if (!xn.deepEquals(o1[p], o2[p])) {
			return false;
		}
	}

	return true;
};

/* Global/Core extensions & overrides */

if ('function' !== typeof RegExp.escape) {
	/**
	* Escapes regular expression
	* @param {String} s
	* @return {String} The escaped string
	* @static
	*/
	RegExp.escape = function(s) {
		if ('string' !== typeof s) {
			return s;
		}
		return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
	};
}

(function() {
	var ua = navigator.userAgent, check = function(r) { return r.test(ua); },
			isIPod = check(/Mozilla.*iPod.*AppleWebKit.*Mobile.*/i),
			isIPad = check(/Mozilla.*iPad.*AppleWebKit.*Mobile.*/i),
			isIPhone = check(/Mozilla.*iPhone.*AppleWebKit.*Mobile.*/i),
			isAndroid = check(/Android/i),
			isMultiTouchDevice = isIPod || isIPad || isIPhone || isAndroid;

	Ext.apply(Ext, {
		isIPod: isIPod, isIPad: isIPad, isIPhone: isIPhone, isMultiTouchDevice: isMultiTouchDevice,

		getTouchOrClickXY: function(evt) {
			var touch = evt.browserEvent.touches ? evt.browserEvent.touches[0] : null;
			var xy = touch ? [touch.pageX, touch.pageY] : evt.xy;

			var target = evt.getTarget(null, null, true);
			return Ext.getRelativeXY(xy, target);
		},

		getRelativeXY: function(xy, element) {
			var offsets = (Ext.isMultiTouchDevice) ? [window.pageXOffset, window.pageYOffset] : [0, 0];
			return [xy[0] - element.getLeft() + offsets[0], xy[1] - element.getTop() + offsets[1]];
		}
	});
})();
