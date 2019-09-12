const { When } = require('cucumber');
let botLib = require('../../lib/bot');

When(/^I DM the bot with standup #(public|private|other)$/, function (channelType, standupText, done) {
	let channel = this.getChannelByType(channelType);

	botLib.getUserStandupInfo(this.botController, this.rtmBot);

	let message ={
		type: 'direct_message',
		user: this.USER_ID,
		text: `standup ${channel.mention}\n${standupText}`,
		channel: this.DM_CHANNEL.id
	};

	this.botRepliesToHearing(message, done);
});

When(/^I DM the bot with standup #(public|private|other) edit$/, function (channelType, done) {
	let channel = this.getChannelByType(channelType);

	botLib.getUserStandupInfo(this.botController, this.rtmBot);

	let message ={
		type: 'direct_message',
		user: this.USER_ID,
		text: `standup ${channel.mention} edit today`,
		channel: this.DM_CHANNEL.id
	};

	this.botRepliesToHearing(message, done, 'direct_message');
});

When(/I edit a DM to the bot to say standup #(public|private|other)/, function (channelType, message, done) {
	let channel = this.getChannelByType(channelType);

	botLib.getUserStandupInfo(this.botController, this.rtmBot);

	this.botRepliesToHearing({
		type: 'message_changed',
		message: {
			type: 'message',
			user: this.USER_ID,
			text: `${channel.mention} ${message}`,
			edited: { user: this.USER_ID, ts: '1234567890.000000' },
			ts: '1234567890.000000'
		},
		subtype: 'message_changed',
		hidden: true,
		channel: this.DM_CHANNEL.id,
		previous_message: {
			type: 'message',
			user: this.USER_ID,
			text: 'Not really relevant...',
			ts: '1234567890.000000'
		},
		event_ts: '1234567890.000000',
		ts: '1234567890.000000'
	}, done);
});
