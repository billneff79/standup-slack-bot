const { When, Then } = require('cucumber');
// var botLib = require('../../lib/bot');
let models = require('../../models');
let helpers = require('../../lib/helpers');
let reminderRunner = require('../../lib/bot/getReminderRunner');


When('the reminder time comes', function() {
	this.existingChannels.push({
		name: this.PUBLIC_CHANNEL.id,
		reminderTime: helpers.time.getScheduleFormat(),
		[helpers.time.getScheduleDay()]: true
	});

	// Kick off the reporter
	reminderRunner(this.rtmBot)();
});

Then('the bot should send a reminder', function(done) {
	// Wait until the findAll and say stubs have been called
	this.wait(() => models.Channel.findAll.called && this.rtmBot.say.called)
		.then(() => {
			done(this.rtmBot.say.args[0][0].text ? undefined : 'Expected bot to report with text');
		})
		.catch(() => done('Timed out waiting for findAllChannels and bot.say to be called'));
});
