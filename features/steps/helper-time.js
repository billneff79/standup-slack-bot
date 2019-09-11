const { Given, When, Then } = require('cucumber');
let timeHelper = require('../../lib/helpers').time;

let _timeString = '';
let _parsedValue = '';
let _baseTime = null;
let _formattedTime = '';
let _convertedTime = '';

Given(/^the string (.*)$/, (timeString) => {
	_timeString = timeString;
});

Given(/^the input time (.*)$/, (time) => {
	if (time !== '') {
		_baseTime = timeHelper.getTimeFromString(time).time;
	}
	else {
		_baseTime = null;
	}
});

Given(/^the database time (.*)$/, (time) => {
	if (time !== '') {
		_baseTime = time;
	}
	else {
		_baseTime = null;
	}
});

When('I try to parse it', () => {
	_parsedValue = timeHelper.getTimeFromString(_timeString);
});

When('I ask for the schedule format', () => {
	_formattedTime = timeHelper.getScheduleFormat(_baseTime);
});

When('I ask for the report format', () => {
	_formattedTime = timeHelper.getReportFormat(_baseTime);
});

When('I ask for the display format', () => {
	_formattedTime = timeHelper.getDisplayFormat(_baseTime);
});

When(/I set a reminder for (\S*) minutes/, (minutes) => {
	_convertedTime = timeHelper.getReminderFormat(_baseTime, minutes);
});

Then(/^the time should( not)? parse$/, (not) => {
	if ((_parsedValue !== false && !not) || (_parsedValue === false && not)) {
		return true;
	}
	throw new Error('Time failed to parse');

});

Then(/^the parsed time and days should be (.*)$/, (expectedTimeAndDays) => {
	//in format HH:mm am|pm Monday,Tuesday,Friday
	let actual = `${_parsedValue.time.format('h:mm a')} ${_parsedValue.days.join(',')}`;
	if (actual !== expectedTimeAndDays) {
		throw new Error('Expected "' + expectedTimeAndDays + '" to equal "' + actual + '"');
	}
	return true;
});

Then(/^the result matches (.*)$/, (pattern) => {
	if (!_formattedTime.match(new RegExp(pattern))) {
		throw new Error('Expected "' + _formattedTime + '" to match "' + pattern + '"');
	}
});

Then(/^the result is (.*)$/, (pattern) => {
	if (_convertedTime !== pattern) {
		throw new Error('Expected "' + _convertedTime + '" to match "' + pattern + '"');
	}
});
