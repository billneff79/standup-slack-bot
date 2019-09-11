const { After, Before, Given, When } = require('cucumber');
let sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');
let helpers = require('../../lib/helpers');

let now;
let _botId = '';

let sandbox;

Before(() => {
	sandbox = sinon.createSandbox();
});

Given(/it (.*) before the standup report has run for the day/, (onTime) => {
	if (onTime === 'is') {
		now = '5:30 am EST';
	}
	else {
		now = '5:30 pm EST';
	}
	sandbox.stub(helpers.time, 'getDisplayFormat')
		.onFirstCall().returns(now)
		.onSecondCall().returns('12:30 pm EST');
});

Given(/^the bot ID is 'U(\d+)'$/, (botId) => {
	_botId = botId;
});

When("I add an emoji reaction to the bot's reminder message", (done) => {
	botLib.startDmEmoji(common.botController, 'U'+_botId);

	let message = {
		type: 'reaction_added',
		item: { channel: 'CSomethingSaySomething' },
		item_user: 'U'+_botId,
		user: 'U7654321',
		reaction: 'thumbsup',
		channel: 'CSomethingSaySomething'
	};

	sandbox.stub(models.Standup, 'findAll').resolves([ ]);

	sandbox.stub(helpers, 'getChannelInfoFromMessage').callsFake((bot, message) => {
		let name = `name-${message.item.channel}`;
		let channelMention = `<#${message.item.channel}|${name}>`;
		return Promise.resolve({ id: message.item.channel, mention: channelMention, name });
	});


	//if a standup is scheduled, a new conversation will start, otherwise a private response will come
	models.Channel.findOne({ channel: message.channel })
		.then(channel => {
			channel ? common.botStartsConvoWith(message, done, 'reaction_added') : common.botReceivesMessage(message, 'reaction_added', done);
		});
});

After(() => {
	sandbox.restore();
});
