const { Given, When } = require('cucumber');
let botLib = require('../../lib/bot');

Given(/^the bot is named "([^"]+)"$/, function (botName) {
	this.botName = botName;
});

When('the bot joins a channel', function (done) {
	botLib.joinChannel(this.botController, this.botName);

	(this.message || (this.message = {})).channel ='CRoom';

	this.botRepliesToHearing(this.message, done, 'bot_channel_join');
});
