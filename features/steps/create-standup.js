
let sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');

module.exports = function() {
	let _message = { };
	let _channelFindOrCreateStub = null;

	this.Given('I am in a private room with the bot', () => {
		botLib.createStandup(common.botController);
		_message.channel = 'PnutButterJellyTime';
	});

	this.When(/I say "@bot ((create|schedule) (standup .*))"/,
		(message, triggerWord, rest, done) => {
			botLib.createStandup(common.botController);

			_message.type = 'message';
			_message.text = message;
			_message.channel = _message.channel || 'CSomethingSaySomething';
			_message.match = [
				message,
				triggerWord,
				rest
			];

			_channelFindOrCreateStub = sinon.stub(models.Channel, 'findOrCreate').resolves([{ name: message.channel }]);
			common.botRepliesToHearing(_message, done);
		});

	this.After(() => {
		if (_channelFindOrCreateStub) {
			_channelFindOrCreateStub.restore();
			_channelFindOrCreateStub = null;
		}
	});
};
