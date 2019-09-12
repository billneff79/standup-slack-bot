const { Given } = require('cucumber');
let fedHolidays = require('@18f/us-federal-holidays');

let fakeTimers = null;

// Fake timers with sinon if they haven't been
// setup already.  Set the internal time to now.
// (Sinon defaults to the epoch).
function setupFakeTimers(date) {
	if (!fakeTimers) fakeTimers = this.sandbox.useFakeTimers(date || new Date());
}

Given('it is a weekday', function () {
	// Go forwards one day at a time until we land
	// on a day that is neither Sunday (0) or
	// Saturday (6).
	let date = new Date();
	while (date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers.call(this, date);

});

Given('it is a weekend', function () {
	// Go forward a day at a time until we land
	// on Saturday or Sunday.
	let date = new Date();
	while (date.getDay() !== 0 && date.getDay() !== 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers.call(this, date);
});

Given('it is not a holiday', function () {
	// Go backwards a day at a time until we land
	// on a weekday that isn't a holiday.
	let date = new Date();
	while (fedHolidays.isAHoliday(date) || date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers.call(this, date);
});

Given('it is a holiday', function () {
	// Go backwards a day at a time until we land
	// on a weekday that is a holiday.
	let date = new Date();
	while (!fedHolidays.isAHoliday(date) || date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers.call(this, date);
});
