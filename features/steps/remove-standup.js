const { After, When } = require('cucumber');
let sinon = require('sinon');
let models = require('../../models');
let botLib = require('../../lib/bot');
let common = require('./common');


When(/I say "@bot (remove standup)"/,
	(messageText, done) => {
		botLib.removeStandup(common.botController, common.rtmBot);
		let message = { text: messageText };
		message.channel = 'CSomethingSaySomething';

		sinon.stub(models.Channel, 'destroy').resolves({ });
		common.botRepliesToHearing(message, done);
	});

After(() => {
	models.Channel.destroy.restore && models.Channel.destroy.restore();
});
