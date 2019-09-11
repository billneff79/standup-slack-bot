const { After, When, Then } = require('cucumber');
let sinon = require('sinon');

let common = require('./common');
let time = require('./time');
let models = require('../../models');
let reportRunner = require('../../lib/bot/getReportRunner');
let helpers = require('../../lib/helpers');

let bot, sandbox;

When('the scheduled time comes', () => {

	sandbox = sinon.createSandbox();
	// Stub the models.Channel and models.Standup findAll
	// methods so we can guarantee behavior without worrying
	// about database contents.
	sandbox.stub(models.Channel, 'findAll').resolves([
		{
			name: 'Test Channel 1',
			audience: null
		},
		{
			name: 'Test Channel 2',
			audience: null
		}]);
	sandbox.stub(helpers, 'doChannelReport');

	bot = sinon.spy();

	//record our current time
	this.reportRunnerTime = Date.now();

	// Kick off the reporter
	reportRunner(bot)();

	// If fake timers have been setup, reset them now.
	// Otherwise, setTimeout won't behave correctly (i.e.,
	// at all).
	time.restoreTimers();
});

Then('the bot should report', (done) => {

	// Wait until the findAll and say stubs have been called
	common.wait(() => models.Channel.findAll)
		.then(() => {
			let foo = sinon.spy();
			foo.calledwith;
			//verify that do channel report was called for each scheduled channel
			if (!helpers.doChannelReport.calledTwice) return done(`doChannelReport should have been called twice but was called ${helpers.doChannelReport.callCount}`);
			if (!helpers.doChannelReport.calledWithExactly(bot, 'Test Channel 1', false)) return done(`doChannelReport should have been called for Test Channel 1`);
			if (!helpers.doChannelReport.calledWithExactly(bot, 'Test Channel 2', false)) return done(`doChannelReport should have been called for Test Channel 2`);
			done();

		});
});

Then('the bot should not report', (done) => {
	// Wait a second to give the report runner time
	// to bail out.  Since it shouldn't be calling
	// anything, we can't just wait until things
	// have been called.
	common.wait(() => models.Channel.findAll)
		.then(() => {
			if (helpers.doChannelReport.called) return done(`doChannelReport should note have been called`);
			done();
		})
		.catch(() => {
			//it should time out because findAll should never be called for holidays
			done();
		});
});

// Teardown stubs
After(() => {
	sandbox && sandbox.restore();
});
