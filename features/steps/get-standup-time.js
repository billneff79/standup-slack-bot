const { After, Given, When } = require('cucumber');
let sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');

let _channelFindStub = null;
let _channelFindResolves = { get(dayName) {
	return false;
} };

// TODO: move these functions to common.js
Given(/the standup is scheduled for ([1-2]?\d:[0-5]\d [ap]m)/, (time) => {
	let plus12 = time.substr(-2, 2) === 'pm' ? 1200 : 0;
	let scheduledTime = Number(time.replace(':', '').substr(0, 4).trim()) + plus12;

	_channelFindResolves.time = scheduledTime;
	if (!_channelFindStub) {
		_channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(_channelFindResolves);
	}
});

Given(/the standup is scheduled on (.*)/, (days) => {
	days = days.split(' ').map(day => day.toLowerCase());
	_channelFindResolves.get = function(dayName) {
		return days.indexOf(dayName.toLowerCase()) >= 0;
	};
	if (!_channelFindStub) {
		_channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(_channelFindResolves);
	}
});

// TODO: move these functions to common.js
Given('no standup is scheduled', () => {
	_channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(null);
});

When(/I say "@bot (when)"/, (messageText, done) => {
	botLib.getStandupInfo(common.botController, common.rtmBot);

	let message = {
		text: messageText,
		channel: 'CSomethingSaySomething'
	};

	common.botRepliesToHearing(message, done);
});

After(() => {
	if (_channelFindStub) {
		_channelFindStub.restore();
		_channelFindStub = null;
	}
});
