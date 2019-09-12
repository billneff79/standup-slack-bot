const { When } = require('cucumber');
let botLib = require('../../lib/bot');

When(/I say "@bot (when)"/, function (messageText, done) {
	botLib.getStandupInfo(this.botController, this.rtmBot);

	this.message.text = messageText;

	this.botRepliesToHearing(this.message, done);
});
