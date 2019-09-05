
let botLib = require('../../lib/bot');
let common = require('./common');

module.exports = function () {
	let _message = { };

	this.When(/I say "@bot ((report) (.*))"/, (message, triggerWord, rest, done) => {
		botLib.userReport(common.botController);

		_message.type = 'message';
		_message.text = message;
		_message.channel = _message.channel || 'CSomethingSaySomething';
		_message.user = _message.user || 'Somebody';
		_message.match = [
			message,
			triggerWord,
			rest
		];

		common.botRepliesToHearing(_message, done);
	});
};
