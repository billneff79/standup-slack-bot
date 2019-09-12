const { When } = require('cucumber');
let models = require('../../models');
let botLib = require('../../lib/bot');


When(/I say "@bot (remove standup)"/, function (messageText, done) {
	botLib.removeStandup(this.botController, this.rtmBot);
	this.message.text = messageText;
	this.sandbox.stub(models.Channel, 'destroy').resolves({ });
	this.botRepliesToHearing(this.message, done);
});
