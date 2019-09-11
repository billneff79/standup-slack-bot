const { When } = require('cucumber');
let botLib = require('../../lib/bot');
let common = require('./common');


When(/I say "@bot (report .*)"/, (messageText, done) => {
	botLib.userReport(common.botController, common.rtmBot);

	let message ={
		text: messageText,
		channel: 'CSomethingSaySomething',
		user: 'U1234'
	};

	common.botRepliesToHearing(message, done);
});
