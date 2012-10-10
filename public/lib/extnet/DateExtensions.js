
Ext.applyIf(Date.prototype, {
	// Similar to ExtJS's clearTime(), but always clones without the need for a parameter and doesn't worry about DST
	withoutTime: function () {
		return new Date(this.getFullYear(), this.getMonth(), this.getDate());
	},
	startOfWeek: function (startOfWeek) {
		var d = this.withoutTime(),
		    start = startOfWeek || 0,
		    diff = d.getDay() - start;
		if (diff < 0) {
			diff += 7;
		}
		return (new Date(d.setDate(d.getDate() - diff)));
	},
	addDays: function (v) {
		return this.add(Date.DAY, v);
	},
	addMonths: function (v) {
		return this.add(Date.MONTH, v);
	},
	addYears: function (v) {
		return this.add(Date.YEAR, v);
	},
	roundTimeToNextInterval: function (step, unit) {
		var u = unit || Date.MINUTE,
		    interval = step;

		switch (u) {
			case Date.DAY:
				interval = interval * 24;
			case Date.HOUR:
				interval = interval * 60;
			case Date.MINUTE:
				interval = interval * 60;
			case Date.SECOND:
				interval = interval * 1000;
			case Date.MILLI:
				break;
			default:
				throw "Unit must be one of: ms, s, mi, h or d";
		}

		var origMs = this.getTime(),
		    whole = (Math.floor(origMs / interval)),
		    frac = (origMs % interval) > 0 ? 1 : 0;
		return new Date((whole + frac) * interval);
	}
});