const { Given, When } = require('cucumber');
let models = require('../../models');
let botLib = require('../../lib/bot');
let helpers = require('../../lib/helpers');

Given(/it (.*) before the standup report has run for the day/, function (onTime) {
	let now = `5:30 ${onTime === 'is' ? 'am' : 'pm'} EST`;
	this.sandbox.stub(helpers.time, 'getDisplayFormat')
		.onFirstCall().returns(now)
		.onSecondCall().returns('12:30 pm EST');
});

Given(/^the bot ID is '(U\d+)'$/, (botId) => {
	this.botId = botId;
});

When("I add an emoji reaction to the bot's reminder message", function (done) {
	botLib.startDmEmoji(this.botController, this.botId);

	Object.assign(this.message, {
		type: 'reaction_added',
		item: { channel: this.message.channel },
		item_user: this.botId,
		user: this.USER_ID,
		reaction: 'thumbsup'
	});

	//if a standup is scheduled, a new conversation will start, otherwise a private response will come
	models.Channel.findOne({ where: { channel: this.message.channel } })
		.then(channel => {
			channel ? this.botRepliesWith(this.message, done, 'reaction_added') : this.botReceivesMessage(this.message, 'reaction_added', done);
		});
});
