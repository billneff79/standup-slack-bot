const { When } = require('cucumber');
let botLib = require('../../lib/bot');

When(/I say "@bot (.*(?:enable|disable) updates)"/, function (messageText, done) {
	botLib.setInChannelUpdate(this.botController, this.rtmBot);
	this.message.text = messageText;
	this.botRepliesToHearing(this.message, done);
});
