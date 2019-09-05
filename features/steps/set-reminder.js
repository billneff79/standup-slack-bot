
// var sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
// var models = require('../../models');

module.exports = function() {
	let _message = { };
	// var _findAllChannelsStub;
	// var _bot;

	this.When(/I say "@bot ((reminder) (.*))"/,
		(message, triggerWord, rest, done) => {
			botLib.setReminder(common.botController, common.rtmBot);

			_message.type = 'message';
			_message.text = message;
			_message.channel = _message.channel || 'CSomethingSaySomething';
			_message.match = [
				message,
				triggerWord,
				rest
			];

			common.botRepliesToHearing(_message, done);
		});

};
