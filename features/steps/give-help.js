const { When } = require('cucumber');
let botLib = require('../../lib/bot');

When(/I say "@bot (help)"/, function(text, done) {
	botLib.giveHelp(this.botController, this.rtmBot);
	this.message.text = text;
	this.botRepliesToHearing(this.message, done);
});

When(/I slash command "(help)"/, function (text, done) {
	botLib.giveHelp(this.botController, this.rtmBot);
	this.webhookBotRepliesToHearing({ text, channel: this.channel.id }, done,'slash_command');
});

When(/I DM the bot with "(help)"/, function(text, done) {
	botLib.giveHelp(this.botController, this.rtmBot);

	this.message.text = text;
	this.message.type='direct_message';

	this.botRepliesToHearing(this.message, done);
});
