const { When } = require('cucumber');
let botLib = require('../../lib/bot');
let common = require('./common');


When(/I say "@bot (reminder .*)"/,
	(messageText, done) => {
		botLib.setReminder(common.botController, common.rtmBot);

		let message = {
			text: messageText,
			channel: 'CSomethingSaySomething'
		};

		common.botRepliesToHearing(message, done);
	});
