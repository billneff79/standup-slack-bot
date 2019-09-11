let { After, Given, When } = require('cucumber');
let sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');

let _message = { };
let _channelFindOrCreateStub = null;

Given('I am in a private room with the bot', () => {
	botLib.createStandup(common.botController, common.rtmBot);
	_message.channel = 'PnutButterJellyTime';
});

When(/I say "@bot ((?:create|schedule) standup .*)"/,
	(message, done) => {
		botLib.createStandup(common.botController, common.rtmBot);

		_message.text = message;
		_message.channel = _message.channel || 'CSomethingSaySomething';

		_channelFindOrCreateStub = sinon.stub(models.Channel, 'findOrCreate').resolves([{ name: message.channel }]);
		common.botRepliesToHearing(_message, done);
	});

After(() => {
	if (_channelFindOrCreateStub) {
		_channelFindOrCreateStub.restore();
		_channelFindOrCreateStub = null;
	}
});
