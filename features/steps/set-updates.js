
let botLib = require('../../lib/bot');
let common = require('./common');

module.exports = function() {
	let _message = { };

	this.When(/I say "@bot ((.*)?(en|dis)able updates)"/,
		(message, maybeStuffBefore, enOrDis, done) => {
			botLib.setInChannelUpdate(common.botController);

			_message.type = 'message';
			_message.text = message;
			_message.match = message.match(/(en|dis)able updates/i);
			_message.channel = _message.channel || 'CSomethingSaySomething';

			common.botRepliesToHearing(_message, done);
		});

};
