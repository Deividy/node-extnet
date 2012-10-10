
/*
* Animal's String Extensions 
* http://www.sencha.com/forum/showthread.php?117277-Is-there-a-ExtJS-function-to-capitalize-initial-letters-of-all-words-in-a-string
*/

Ext.applyIf(String.prototype, function () {	
	function uc(str, p1) {
		return p1.toUpperCase();
	}

	function lc(str, p1) {
		return p1.toLowerCase();
	}

	var camelRe = /-([a-z])/g,
			titleRe = /((?:\s|^)[a-z])/g,
			capsRe = /^([a-z])/,
			decapRe = /^([A-Z])/,
			upperRe = /([A-Z])/g,
			leadAndTrailWS = /^\s*([^\s]*)?\s*/,
			result;

	return {
		leftPad: function (val, size, ch) {
			result = String(val);
			if (!ch) {
				ch = " ";
			}
			while (result.length < size) {
				result = ch + result;
			}
			return result;
		},

		camel: function (s) {
			return this.replace(camelRe, uc);
		},

		title: function (s) {
			return this.replace(titleRe, uc);
		},

		nice: function (s) {
			return this.title().replace(upperRe, ' $1').normalizeWhiteSpace().trim();
		},

		capitalize: function () {
			return this.replace(capsRe, uc);
		},

		decapitalize: function () {
			return this.replace(decapRe, lc);
		},

		startsWith: function (prefix) {
			return this.substr(0, prefix.length) == prefix;
		},

		endsWith: function (suffix) {
			var start = this.length - suffix.length;
			return (start > -1) && (this.substr(start) == suffix);
		},

		/**
		* Remove leading and trailing whitespace.
		*/
		normalize: function () {
			return leadAndTrailWS.exec(this)[1] || '';
		},

		/**
		* Case insensitive String equality test
		*/
		equalsIgnoreCase: function (other) {
			return (this.toLowerCase() == (String(other).toLowerCase()));
		},

		isAllLetters: function () {
			return this.match(/^[^\d\s]+$/i);
		},

		isAllNumbers: function (allowFloat) {
			if (allowFloat) {
				return this.match(/^[\d.,]+$/i);
			}
			return this.match(/^[\d]+$/i);
		},

		normalizeWhiteSpace: function () {
			return this.replace(/\s+/g, ' ');
		}
	};
} ());