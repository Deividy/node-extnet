
Ext.applyIf(Array.prototype, {
	each: function (fn, scope) {
		Ext.each(this, fn, scope);
	},

	aggregate: function (fn, v) {
		for (var i = 0; i < this.length; i++) {
			v = fn.call(this[i], v);
		}

		return v;
	},

	first: function (filter) {
		for (var i = 0; i < this.length; i++) {
			if (filter.call(this[i], this[i])) {
				return this[i];
			}
		}
	},

	indexOf: function (o) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === o) {
				return i;
			}
		}

		return -1;
	},

	where: function (filter) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (filter.call(this[i], this[i])) {
				result.push(this[i]);
			}
		}

		return result;
	},

	contains: function (o) {
		return this.indexOf(o) >= 0;
	},

	containsAny: function (a) {
		for (var i = 0; i < a.length; i++) {
			if (this.contains(a[i])) {
				return true;
			}
		}

		return false;
	},

	select: function (project) {
		var result = new Array(this.length);
		for (var i = 0; i < this.length; i++) {
			result[i] = project.call(this[i], this[i], i);
		}

		return result;
	},

	transform: function (t) {
		for (var i = 0; i < this.length; i++) {
			this[i] = t.call(this[i], this[i]);
		}

		return this;
	},

	all: function (test) {
		for (var i = 0; i < this.length; i++) {
			if (!test.call(this[i], this[i])) {
				return false;
			}
		}

		return true;
	},

	any: function (test) {
		for (var i = 0; i < this.length; i++) {
			if (test.call(this[i], this[i])) {
				return true;
			}
		}

		return false;
	},

	toArrayStore: function (fieldName) {
		fieldName = fieldName || 'name';

		return new Ext.data.ArrayStore({
			autoDestroy: true,
			data: this.select(function (o, i) { return [i, o]; }),
			fields: ['id', fieldName], idIndex: 0
		});
	},

	distinct: function () {
		var result = [];
		var o = {};
		for (var i = 0; i < this.length; i++) {
			var v = this[i];
			if (o[v]) {
				continue;
			}

			result.push(v);
			o[v] = true;
		}

		return result;
	},

	last: function () {
		return this[this.length - 1];
	},

	binarySearch: function (key, comparer) {
		comparer = comparer || xn.Util.comparer;

		var low = 0;
		var high = this.length - 1;

		while (low <= high) {
			var mid = Math.floor((low + high) / 2);
			var midVal = this[mid];

			var c = comparer(key, midVal);

			if (c > 0)
				low = mid + 1
			else if (c < 0)
				high = mid - 1;
			else
				return mid; // key found
		}
		return -(low + 1);  // key not found.
	},

	deepEquals: function (arr) {
		if (this.length != arr.length) {
			return false;
		}

		for (var i = 0; i < this.length; i++) {
			if (!xn.deepEquals(this[i], arr[i])) {
				return false;
			}
		}

		return true;
	},

	insertSortedUnique: function (item, comparer) {
		var index = this.binarySearch(item, comparer);
		if (index > 0) {
			return -1;
		}

		index = ~index;
		this.splice(index, 0, item);
		return index;
	}
});

