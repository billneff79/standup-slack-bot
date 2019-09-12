const { When } = require('cucumber');
let botLib = require('../../lib/bot');


When(/I say "@bot (reminder .*)"/, function	(messageText, done) {
	botLib.setReminder(this.botController, this.rtmBot);

	this.message.text= messageText;

	this.botRepliesToHearing(this.message, done);
});
