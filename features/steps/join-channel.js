const { Given, When } = require('cucumber');
let botLib = require('../../lib/bot');
let common = require('./common');

Given(/^the bot is named "([^"]+)"$/, (botName) => {
	this.botName = botName;
});

When('the bot joins a channel', (done) => {
	botLib.joinChannel(common.botController, this.botName);

	let message = {
		channel: 'CSomethingSaySomething'
	};

	common.botRepliesToHearing(message, done, 'bot_channel_join');
});
