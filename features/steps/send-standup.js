const { After, Before, Given, When } = require('cucumber');
let sinon = require('sinon');
let botLib = require('../../lib/bot');
let models = require('../../models');
let common = require('./common');
let helpers = require('../../lib/helpers');

let sandbox;
let channel, channelMention;

Before(() => {
	channel = channelMention = undefined;
	sandbox = sinon.createSandbox();
});

Given(/I want to send a standup for a ([^>]+) channel/, (visibility) => {
	if (visibility === 'public') {
		channel = 'CSomethingSaySomething';
		channelMention = `<#${channel}|name-${channel}>`;
	}
	else {
		channel = 'PnutButterJellyTime';
		channelMention = `#PnutButterJellyTime`;
	}
});

Given(/^the channel (.+) have a standup/, (status) => {
	let hasStandup = status === 'does';
	sandbox.stub(models.Channel, 'findOne').resolves(hasStandup ? {
		time: '130', name: 'CSomethingSaySomething', audience: null, latestReport: '123467.01'
	} : undefined);
	sandbox.stub(models.Standup, 'findOrCreate').resolves({ });
	sandbox.stub(models.Standup, 'findOne').resolves(hasStandup ? {
		user: 'U00000000',
		userRealName: 'Bob the Tester',
		yesterday: 'In the past',
		today: 'Now',
		blockers: 'Barricades',
		goal: 'Accomplishments-to-be'
	} : undefined);
});

When(/^I DM the bot with standup$/, (standupText, done) => {
	botLib.getUserStandupInfo(common.botController, common.rtmBot);

	sandbox.stub(models.Standup, 'update').resolves({ });
	let message = {
		user: 'U7654321',
		text: `standup ${channelMention}\n${standupText}`,
		channel: 'Dchannel'
	};

	sandbox.stub(helpers, 'getChannelInfoFromMessage').callsFake((bot, message) => {
		let name = `name-${message.channel}`;
		return Promise.resolve({ id: message.channel, mention: channelMention, name });
	});

	common.botRepliesToHearing(message, done, 'direct_message');
});

When(/^I DM the bot with (valid|invalid) standup edit$/, (valid, done) => {
	botLib.getUserStandupInfo(common.botController, common.rtmBot);

	let message = {
		user: 'U7654321',
		text: `standup ${channelMention} edit today`,
		channel: 'Dchannel'
	};

	sandbox.stub(helpers, 'getChannelInfoFromMessage').callsFake((bot, message) => {
		let name = `name-${message.channel}`;
		return Promise.resolve({ id: message.channel, mention: channelMention, name });
	});

	if (valid === 'valid') {
		common.botStartsConvoWith(message, done, 'direct_message');
	}
	else {
		common.botRepliesToHearing(message, done, 'direct_message');
	}
});

When('I edit a DM to the bot to say', (message, done) => {
	botLib.getUserStandupInfo(common.botController, common.rtmBot);
	sandbox.stub(models.Channel, 'update').resolves({ });
	sandbox.stub(helpers, 'getChannelInfoFromMessage').callsFake((bot, message) => {
		let name = `name-${message.channel}`;
		return Promise.resolve({ id: message.channel, mention: channelMention, name });
	});

	common.botRepliesToHearing({
		type: 'message_changed',
		message: {
			type: 'message',
			user: 'U7654321',
			text: `${channelMention} ${message}`,
			edited: { user: 'U7654321', ts: '1234567890.000000' },
			ts: '1234567890.000000'
		},
		subtype: 'message_changed',
		hidden: true,
		channel: 'Dchannel',
		previous_message: {
			type: 'message',
			user: 'U7654321',
			text: 'Not really relevant...',
			ts: '1234567890.000000'
		},
		event_ts: '1234567890.000000',
		ts: '1234567890.000000'
	}, done);
});

After(() => {
	sandbox.restore();
});
