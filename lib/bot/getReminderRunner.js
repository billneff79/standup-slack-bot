

let log = require('../../getLogger')('reminder runner');
let _ = require('underscore');
let models = require('../../models');
let helpers = require('../helpers');
let fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
	let time = helpers.time.getScheduleFormat();

	// Don't run if today is a federal holiday
	if (fedHolidays.isAHoliday()) {
		return;
	}

	// Find channels that want a reminder at this minute
	let where = {
		reminderTime: time
	};
	where[helpers.time.getScheduleDay()] = true;

	models.Channel.findAll({
		where
	}).then((channels) => {
		if (channels.length > 0) {
			log.info('Sending reminders for ' + channels.length + ' channel(s)');

			// Iterate over the channels
			_.each(channels, (channel) => {
				// Set report audience
				let audience = channel.audience === null ? '<!here>' : '@'+channel.audience ;

				let reminder = {
					text: audience+' :hourglass: There\'s a standup in '+channel.reminderMinutes+' minutes! '+
             'To submit your standup, DM me! Or, add any emoji to this message and I\'ll DM you to get your standup info.',
					attachments: [],
					channel: channel.name
				};
				anytimeBot.say(reminder, (err, response) => {
					if (!err) {
						anytimeBot.api.reactions.add({
							name: 'wave',
							channel: channel.name,
							timestamp: response.message.ts
						});
					}
				});
			});
		}
	});
}

module.exports = function(anytimeBot) {
	return function() {
		runReports(anytimeBot);
	};
};
