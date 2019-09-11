const { When } = require('cucumber');
let botLib = require('../../lib/bot');
let common = require('./common');

const doIt = (type) => (text, done) => {
	botLib.giveHelp(common.botController, common.rtmBot);
	common.botWhispersToHearing({ text, channel: 'CSomethingSaySomething' }, done);
};

When(/I say "@bot (help)"/, doIt('direct_mention'));
When(/I slash command "(help)"/, (text, done) => {
	botLib.giveHelp(common.botController, common.rtmBot);
	common.webhookBotPrivateReplyToHearing({ text, channel: 'CSomethingSaySomething' }, done,'slash_command');
});
When(/I DM the bot with "(help)"/, doIt('direct_message'));
