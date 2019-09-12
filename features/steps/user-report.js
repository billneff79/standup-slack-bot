const { When } = require('cucumber');
let botLib = require('../../lib/bot');


When(/I say "@bot (report .*)"/, function(messageText, done) {
	botLib.userReport(this.botController, this.rtmBot);

	this.message.text = messageText;
	this.message.user = 'U1234';

	this.botRepliesToHearing(this.message, done);
});
