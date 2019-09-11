const { After, Given } = require('cucumber');
let sinon = require('sinon');
let fedHolidays = require('@18f/us-federal-holidays');

let fakeTimers = null;

// Fake timers with sinon if they haven't been
// setup already.  Set the internal time to now.
// (Sinon defaults to the epoch).
function setupFakeTimers(date) {
	if (!fakeTimers) {
		fakeTimers = sinon.useFakeTimers(date || new Date());
	}
}

Given('it is a weekday', () => {
	// Go forwards one day at a time until we land
	// on a day that is neither Sunday (0) or
	// Saturday (6).
	let date = new Date();
	while (date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers(date);

});

Given('it is a weekend', () => {
	// Go forward a day at a time until we land
	// on Saturday or Sunday.
	let date = new Date();
	while (date.getDay() !== 0 && date.getDay() !== 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers(date);
});

Given('it is not a holiday', () => {
	// Go backwards a day at a time until we land
	// on a weekday that isn't a holiday.
	let date = new Date();
	while (fedHolidays.isAHoliday(date) || date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers(date);
});

Given('it is a holiday', () => {
	// Go backwards a day at a time until we land
	// on a weekday that is a holiday.
	let date = new Date();
	while (!fedHolidays.isAHoliday(date) || date.getDay() === 0 || date.getDay() === 6) {
		date = new Date(date.getTime()+86400000);
	}
	setupFakeTimers(date);
});

// Reset fake timers
After(() => {
	module.exports.restoreTimers();
});

// Provide a mechanism for manually resetting the
// timers if needed.
module.exports.restoreTimers = function() {
	if (fakeTimers) {
		fakeTimers.restore();
		fakeTimers = null;
	}
};
