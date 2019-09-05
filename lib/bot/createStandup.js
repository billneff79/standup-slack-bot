

let log = require('../../getLogger')('create standup');
let models = require('../../models');
let timeHelper = require('../helpers').time;
let badStandupResponse = require('./replyToBadStandup');

function createStandup(bot, message) {
	log.verbose('Heard a request to create a standup:\n' + message.match[0]);
	if (message.channel[0] === 'C') {
		let scheduled = timeHelper.getTimeFromString(message.match[2]);
		if (scheduled !== false) {
			// TODO: consider using upsert here
			models.Channel.findOrCreate({
				where: {
					name: message.channel
				}
			}).then((channel) => {
				let updatedChannel = {
					time: timeHelper.getScheduleFormat(scheduled.time),
					reminderTime: timeHelper.getReminderFormat(timeHelper.getScheduleFormat(scheduled.time), channel[0].reminderMinutes)
				};

				['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day) => {
					updatedChannel[day.toLowerCase()] = (scheduled.days.indexOf(day) >= 0);
				});

				models.Channel.update(updatedChannel,
					{
						where: {
							name: message.channel
						}
					}
				);
				log.info('Standup scheduled for ' + message.channel + ' at ' +
          timeHelper.getDisplayFormat(scheduled.time) + ' on ' +
          timeHelper.getDisplayFormatForDays(scheduled.days));
				return bot.reply(message,
					'Got it. Standup scheduled for '+timeHelper.getDisplayFormat(scheduled.time)+
          ' on ' + timeHelper.getDisplayFormatForDays(scheduled.days)
				);
			});
		}
		else {
			return badStandupResponse(bot, message, scheduled.time);
		}
	}
	else {
		log.warn('Channel is not public');
		return bot.reply(message, 'I can only work with public channels. Sorry!');
	}
}

function attachListener(controller) {
	controller.hears(['(schedule|create|move) standup (.*)'],['direct_mention'], createStandup);
	log.verbose('Attached');
}

module.exports = attachListener;
