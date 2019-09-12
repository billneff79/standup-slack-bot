const { Given, When } = require('cucumber');
let botLib = require('../../lib/bot');

Given('I am already being interviewed for another channel', function (done){
	botLib.startInterview(this.botController, this.rtmBot);

	const message = {
		user: this.USER_ID,
		text: 'interview',
		channel: this.OTHER_CHANNEL.id
	};

	this.existingChannels.push({ time: '1230', name: message.channel });

	this.botRepliesToHearing(message, done);
});

When(/I say "@bot\b.*(\binterview\b.*)"/, function (interviewText, done) {
	botLib.startInterview(this.botController, this.rtmBot);

	Object.assign(this.message, {
		user: this.USER_ID,
		text: interviewText
	});

	this.botRepliesToHearing(this.message, done);
});
