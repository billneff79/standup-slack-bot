const { When } = require('cucumber');
let botLib = require('../../lib/bot');
let common = require('./common');

let _message = { };

When(/I say "@bot (.*(?:enable|disable) updates)"/,
	(messageText, done) => {
		botLib.setInChannelUpdate(common.botController, common.rtmBot);

		let message = {
			text: messageText,
			channel: 'CSomethingSaySomething'
		};

		common.botRepliesToHearing(message, done);
	});
