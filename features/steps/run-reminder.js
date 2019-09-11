const { After, When, Then } = require('cucumber');
let sinon = require('sinon');
// var botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');
let reminderRunner = require('../../lib/bot/getReminderRunner');

let _findAllChannelsStub;
let _bot;

When('the reminder time comes', () => {
	_findAllChannelsStub = sinon.stub(models.Channel, 'findAll').resolves([{
		name: 'Test Channel',
		audience: null
	}]);

	// Also stub the bot
	_bot = { };
	_bot.say = sinon.spy();

	// Kick off the reporter
	reminderRunner(_bot)();
});

Then('the bot should send a reminder', (done) => {
	// Wait until the findAll and say stubs have been called
	common.wait(() => _findAllChannelsStub.called && _bot.say.called)
		.then(() => {
			// If the bot sent text, it tried to
			// report correctly.
			if (_bot.say.args[0][0].text) {
				done();
			}
			else {
				done(new Error('Expected bot to report with text'));
			}
		})
		.catch(() => done('Timed out waiting for findAllChannels and bot.say to be called'));
});

// Teardown stubs
After(() => {
	if (_findAllChannelsStub) {
		_findAllChannelsStub.restore();
	}
});
