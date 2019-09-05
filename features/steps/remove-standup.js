
let sinon = require('sinon');
let models = require('../../models');
let botLib = require('../../lib/bot');
let common = require('./common');

module.exports = function() {
	let _message = { };
	let _channelDestroyStub = null;

	this.When(/I say "@bot ((remove|delete) (standup))"/,
		(message, triggerWord, rest, done) => {
			botLib.removeStandup(common.botController, common.rtmBot);

			_message.type = 'message';
			_message.text = message;
			_message.channel = _message.channel || 'CSomethingSaySomething';
			_message.match = [
				message,
				triggerWord,
				rest
			];

			_channelDestroyStub = sinon.stub(models.Channel, 'destroy').resolves({ });
			common.botRepliesToHearing(_message, done);
		});

	this.After(() => {
		if (_channelDestroyStub) {
			_channelDestroyStub.restore();
			_channelDestroyStub = null;
		}
	});
};
