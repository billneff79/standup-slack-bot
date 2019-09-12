const { When, Then } = require('cucumber');
const assert = require('assert');

let models = require('../../models');
let reportRunner = require('../../lib/bot/getReportRunner');
let helpers = require('../../lib/helpers');

When('the scheduled time comes', function() {

	this.existingChannels.push(	{
		name: 'Test Channel 1',
		audience: null,
		[helpers.time.getScheduleDay()]: true,
		time: helpers.time.getScheduleFormat()
	},
	{
		name: 'Test Channel 2',
		[helpers.time.getScheduleDay()]: true,
		time: helpers.time.getScheduleFormat(),
		audience: null
	});

	this.sandbox.stub(helpers, 'doChannelReport');

	//record our current time
	this.reportRunnerTime = Date.now();

	// Kick off the reporter
	reportRunner(this.rtmBot)();

	// If fake timers have been setup, reset them now.
	// Otherwise, setTimeout won't behave correctly (i.e.,
	// at all).
	this.sandbox.clock && this.sandbox.clock.restore && this.sandbox.clock.restore();
});

Then('the bot should report', function(done) {

	// Wait until the findAll and say stubs have been called
	this.wait(() => models.Channel.findAll)
		.then(() => {
			//verify that do channel report was called for each scheduled channel
			assert(helpers.doChannelReport.calledTwice, `doChannelReport should have been called twice but was called ${helpers.doChannelReport.callCount}`);
			assert(helpers.doChannelReport.calledWithExactly(this.rtmBot, 'Test Channel 1', false), `doChannelReport should have been called for Test Channel 1`);
			assert(helpers.doChannelReport.calledWithExactly(this.rtmBot, 'Test Channel 2', false), `doChannelReport should have been called for Test Channel 2`);
			done();
		});
});

Then('the bot should not report', function(done) {
	// Wait a second to give the report runner time
	// to bail out.  Since it shouldn't be calling
	// anything, we can't just wait until things
	// have been called.
	this.wait(() => models.Channel.findAll)
		.then(() => {
			assert(!helpers.doChannelReport.called, `doChannelReport should note have been called`);
			done();
		})
		.catch(() => {
			//it should time out because findAll should never be called for holidays
			done();
		});
});
