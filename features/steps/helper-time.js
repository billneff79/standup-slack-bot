const { Given, When, Then } = require('cucumber');
let timeHelper = require('../../lib/helpers').time;
const assert = require('assert');

Given(/^the time string (.*)$/, (timeString) => {
	this.timeString = timeString;
});

Given(/^the input time (.*)$/, (time) => {
	this.baseTime = time !== '' ? timeHelper.getTimeFromString(time).time : null;
});

Given(/^the database time (.*)$/, (time) => {
	this.baseTime = time !== '' ? time : null;
});

When('I try to parse it', () => {
	this.parsedValue = timeHelper.getTimeFromString(this.timeString);
});

When('I ask for the schedule format', () => {
	this.formattedTime = timeHelper.getScheduleFormat(this.baseTime);
});

When('I ask for the report format', () => {
	this.formattedTime = timeHelper.getReportFormat(this.baseTime);
});

When('I ask for the display format', () => {
	this.formattedTime = timeHelper.getDisplayFormat(this.baseTime);
});

When(/I set a reminder for (\S*) minutes/, (minutes) => {
	this.convertedTime = timeHelper.getReminderFormat(this.baseTime, minutes);
});

Then(/^the time should( not)? parse$/, (not) => {
	assert.equal(!!this.parsedValue, !not, `Time did not parse as expected`);
});

Then(/^the parsed time and days should be (.*)$/, (expectedTimeAndDays) => {
	//in format HH:mm am|pm Monday,Tuesday,Friday
	let actual = `${this.parsedValue.time.format('h:mm a')} ${this.parsedValue.days.join(',')}`;
	assert.equal(actual, expectedTimeAndDays);
});

Then(/^the result matches (.*)$/, (pattern) => {
	assert(this.formattedTime.match(new RegExp(pattern)), `Expected "${this.formattedTime}" to match "${pattern}"`);
});

Then(/^the result is (.*)$/, (pattern) => {
	assert.equal(this.convertedTime, pattern);
});
