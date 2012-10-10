
var MASKEDFIELD = function () {

	var KEY_CODES = [
		Ext.EventObject.BACKSPACE,
		Ext.EventObject.DELETE,
		Ext.EventObject.HOME,
		Ext.EventObject.END,
		Ext.EventObject.RIGHT,
		Ext.EventObject.LEFT,
		Ext.EventObject.TAB,
		Ext.EventObject.ENTER
	];

	var KEY_RANGES = {
		numeric: [48, 57],
		padnum: [96, 105],
		characters: [65, 90],
		all: [0, 255]
	};

	var isInRange = function (charCode, range) {
		return charCode >= range[0] && charCode <= range[1];
	};

	var wildcards = ['#', '?', '*'];

	var getRange = function (wildcard) {
		switch (wildcards.indexOf(wildcard)) {
			case 0:
				return [KEY_RANGES["numeric"]];
			case 1:
				return [KEY_RANGES["characters"]];
			case 2:
				return [KEY_RANGES["all"]];
		}
		return null;
	};


	var isMaskChar = function (chr) {
		return wildcards.indexOf(chr) >= 0;
	};

	var getDefaultString = function (mask, placeholder) {
		var str = '';
		for (var i = 0; i < mask.length; i++) {
			var chr = mask.charAt(i);
			str += isMaskChar(chr) ? placeholder : chr;
		}
		return str;
	};

	var convertToUnMaskedIndex = function (maskedIndex, mask) {
		var result = -1;
		for (var i = 0; i <= maskedIndex; i++) {
			result += isMaskChar(mask.charAt(i)) ? 1 : 0;
		}
		return result;
	};

	var convertToMaskedIndex = function (unMaskedIndex, mask) {
		var result = -1, length = mask.length;
		for (var i = 0; i <= unMaskedIndex; i++) {
			do {
				result++;
			} while (!isMaskChar(mask.charAt(result)) && (result < length));
		}
		return result;
	};

	var getFirstEditableIndex = function (mask) {
		for (var i = 0; i < mask.length - 1; i++) {
			if (isMaskChar(mask.charAt(i))) {
				return i;
			}
		}
	};

	var applyMask = function (value, mask, placeholder) {
		var j = 0, result = '', max = value.length;

		for (var i = 0; i < mask.length; i++) {
			if (isMaskChar(mask.charAt(i))) {
				result += (j < max) ? value.charAt(j) : placeholder;
				j++;
			} else {
				result += mask.charAt(i);
			}
		}
		return result;
	};

	var unMask = function (value, mask) {
		var result = '';
		for (var i = 0; i < mask.length; i++) {
			if (!isMaskChar(mask.charAt(i))) {
				continue;
			}
			result += value.charAt(i);
		}
		return result;
	};

	var getNextPosition = function (position, mask, step) {
		var previousPosition = position, length = mask.length;
		var s = step || 1;

		do {
			position += s;
		}
		while (!isMaskChar(mask.charAt(position)) && (position < length) && (position >= 0));

		if (isMaskChar(mask.charAt(position)) || position == length) {
			return position;
		} else {
			return previousPosition;
		}
	};

	Ext.form.MaskedField = Ext.extend(Ext.form.TextField, {
		placeholder: '_',

		emptyChar: ' ',

		autoSelect: false,

		constructor: function (config) {
			if (Ext.isDefined(config.selectOnFocus)) {
				this.autoSelect = config.selectOnFocus;
				config.selectOnFocus = false;
			}

			Ext.apply(this, config);
			if (!Ext.isDefined(this.mask)) {
				throw 'config.mask must be provided.'
			}

			var pattern = '';
			Ext.each(wildcards, function (w) {
				pattern += '\\' + w + '|';
			});

			pattern = pattern.substr(0, pattern.length - 1);

			this.emptyText = this.mask.replace(new RegExp(pattern, 'g'), this.placeholder);

			Ext.form.MaskedField.superclass.constructor.apply(this, arguments);

		},

		initComponent: function () {
			Ext.form.MaskedField.superclass.initComponent.call(this);
		},

		// private
		initEvents: function () {
			Ext.form.MaskedField.superclass.initEvents.call(this);

			this.mon(this.el, {
				scope: this,
				keydown: this.onKeyDown,
				mouseup: this.onMouseUp
			});

		},

		render: function (container, position) {
			Ext.form.MaskedField.superclass.render.apply(this, arguments);
			this.el.set({
				autocomplete: 'off'
			});
		},

		// private
		onKeyDown: function (e) {
			var me = this;
			var processKey = function () {
				if (me.readOnly) {
					return true;
				}

				if (e.ctrlKey) {
					return false;
				}
				var k = e.getKey();

				switch (k) {
					case Ext.EventObject.BACKSPACE:
						me.doBackspace();
						break;
					case Ext.EventObject.DELETE:
						me.doDelete();
						break;
					case Ext.EventObject.HOME:
						if (e.shiftKey) {
							return false;
						}
						me.doHome();
						break;
					case Ext.EventObject.END:
						if (e.shiftKey) {
							return false;
						}
						me.doEnd();
						break;
					case Ext.EventObject.RIGHT:
						if (e.shiftKey) {
							return false;
						}
						me.moveCaret(1);
						break;
					case Ext.EventObject.LEFT:
						if (e.shiftKey) {
							return false;
						}
						me.moveCaret(-1);
						break;
					case Ext.EventObject.ENTER:
					case Ext.EventObject.TAB:
						return false;
					default:
						me.doMask(k);
				}
				return true;
			};

			var stopEvent = processKey();

			if (!this.readOnly && this.enableKeyEvents) {
				this.fireEvent('keydown', this, e);
			}

			if (stopEvent) {
				e.stopEvent();
			}
		},

		// private
		doHome: function () {
			this.moveCaret(1, -1, this.mask);
		},

		// private
		doEnd: function () {
			var l = this.getValue();
			this.moveCaret(-1, convertToMaskedIndex(l.length, this.mask) + 1, this.mask);
		},

		// private
		doBackspace: function () {
			var p = this.getCaretPosition(),
				isRange = p.left != p.right,
				selStart = !isRange ? getNextPosition(p.left, this.mask, -1) : p.left;
			this.deleteSelection(selStart, p.right);
			this.moveCaret(-1, selStart + 1);
		},

		// private
		doDelete: function () {
			var p = this.getCaretPosition(),
				selEnd = p.right == p.left ? p.left + 1 : p.right;
			this.deleteSelection(p.left, selEnd);
			this.moveCaret(1, p.left - 1);
		},

		deleteSelection: function (selStart, selEnd) {
			var m = this.mask,
				d = this.el.dom,
				v = this.getValue().split(''),
				left = false,
				discard = 0,
				count = 0;

			for (var i = 0; i < selEnd; i++) {
				if (isMaskChar(m.charAt(i))) {
					if (i >= selStart) {
						count++;
						left = left === false ? i - discard : left;
					}
				} else {
					discard++;
				}
			}

			v.splice(left, count);
			d.value = applyMask(v.join(''), m, this.placeholder);
		},

		// private
		getCaretPosition: function () {
			var left, right;

			if (!this.el.dom) {
				return null;
			}

			var fieldEl = this.el.dom;
			if (fieldEl.createTextRange) {
				var range = document.selection.createRange().duplicate();
				range.moveEnd('character', fieldEl.value.length);

				if (!range.text) {
					left = fieldEl.value.length;
				}
				else {
					left = fieldEl.value.lastIndexOf(range.text);
				}

				range = document.selection.createRange().duplicate();
				range.moveStart("character", -(fieldEl.value.length));

				right = range.text.length;
			}
			else {
				left = fieldEl.selectionStart;
				right = fieldEl.selectionEnd;
			}

			return {
				left: Math.min(left, right),
				right: Math.max(left, right)
			};
		},

		// private
		moveCaret: function (step, left) {
			if (step == 0) {
				return false;
			}

			var position = left || this.getCaretPosition().left, l = this.el.dom.value.length;

			if (position == 0 && step < 0) {
				return false;
			}

			if (position >= l && step > 0) {
				return false;
			}

			this.setSelection(getNextPosition(position, this.mask, step));
			return true;
		},

		// private
		setSelection: function (leftPos, rightPos) {
			var left = leftPos, right = rightPos || left, d = this.el.dom;

			if (d.createTextRange) {
				var range = d.createTextRange();
				range.moveStart("character", left);
				range.moveEnd("character", right - d.value.length);
				range.select();
			}
			else {
				d.setSelectionRange(left, right);
			}
		},

		doSelection: function (evt) {
			var pos = getCaretPosition().left;

			if (pos == field.dom.value.length) {
				pos--;
			}

			if (!isMaskChar(mask.charAt(pos))) {
				if (!moveCaret(1)) {
					moveCaret(-1);
				}
			}
			else {
				setSelection(pos);
			}
		},

		doMask: function (key) {
			if (isInRange(key, KEY_RANGES["padnum"])) {
				key -= 48;
			}

			var p = this.getCaretPosition(), position = -1;

			for (var i = p.left; i <= p.right; i++) {
				if (isMaskChar(this.mask.charAt(i))) {
					position = i;
					break;
				}
			}

			if (position == -1) {
				return;
			}

			var ranges = getRange(this.mask.charAt(position)), valid = false;

			for (var i = 0; i < ranges.length; i++) {
				if (isInRange(key, ranges[i])) {
					valid = true;
					break;
				}
			}

			if (valid) {
				var fieldValue = this.el.dom.value.split('');
				fieldValue[position] = String.fromCharCode(key);

				this.el.dom.value = fieldValue.join('');
				this.setSelection(getNextPosition(position, this.mask));
			}
		},

		applyEmptyText: function () {
			if (this.rendered && this.getRawValue().length < 1 && !this.hasFocus) {
				this.setRawValue(this.emptyText);
				this.el.addClass(this.emptyClass);
			}
		},

		setValue: function (v) {
			if (this.el && !Ext.isEmpty(v)) {
				this.el.removeClass(this.emptyClass);
			}
			this.value = v;

			if (this.rendered) {
				this.el.dom.value = (Ext.isEmpty(v) ? '' : applyMask(v, this.mask, this.placeholder));
				this.validate();
			}

			this.applyEmptyText();
			this.autoSize();
			return this;
		},

		getValue: function () {
			if (!this.rendered) {
				return this.value;
			}
			var v = this.el.getValue();
			if (v === this.emptyText || v === undefined) {
				v = '';
			} else {
				v = unMask(v, this.mask).replace(new RegExp(this.placeholder, 'g'), this.emptyChar).trim();
			}
			return v;
		},

		// private
		preFocus: function () {
			this.el.removeClass(this.emptyClass);
			if (this.autoSelect) {

				this.selectAll();
			}
		},

		selectAll: function () {
			var v = this.getValue(),
					first = convertToMaskedIndex(0, this.mask),
					last = convertToMaskedIndex((v.length || 0), this.mask);
			this.selectTask = new Ext.util.DelayedTask(this.setSelection, this, [first, last]);
			this.selectTask.delay(10);
		},

		onMouseUp: function (e) {
			if (!this.hasFocus) {
				return;
			}

			var v = this.getValue(),
				first = convertToMaskedIndex(0, this.mask),
				last = convertToMaskedIndex((v.length || 0), this.mask);
			p = this.getCaretPosition(),
				l = p.right - p.left;

			var left = p.left > first ? p.left < last ? p.left : last : first,
				right = p.right < last ? p.right : last;

			if (!isMaskChar(this.mask.charAt(left))) {
				left = getNextPosition(left, this.mask, left <= last ? 1 : -1);
			}

			if (l == 0) {
				right = left;
			} else {
				right = getNextPosition(right + 1, this.mask, -1);
				right++;
			}

			this.setSelection(left, right < last ? right : last);
		}

	});
	Ext.apply(Ext.form.MaskedField, { applyMask: applyMask });
	Ext.reg('maskedfield', Ext.form.MaskedField);
} ();

