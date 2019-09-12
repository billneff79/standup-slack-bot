let { When } = require('cucumber');
let botLib = require('../../lib/bot');

When(/I say "@bot ((?:create|schedule) standup .*)"/,
	function(message, done) {
		botLib.createStandup(this.botController, this.rtmBot);

		this.message.text = message;

		this.botRepliesToHearing(this.message, done);
	});


