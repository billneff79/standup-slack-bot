

let log = require('../../getLogger')('create standup');
let models = require('../../models');
const { time: timeHelper, getResponseFunction }  = require('../helpers');
let badStandupResponse = require('./replyToBadStandup');

function createStandup(rtmBot, bot, message) {
	log.verbose('Heard a request to create a standup:\n' + message.match[0]);
	let replyFn = getResponseFunction(rtmBot, bot, message, true);

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
			return replyFn(message,
				'Standup scheduled for '+timeHelper.getDisplayFormat(scheduled.time)+
          ' on ' + timeHelper.getDisplayFormatForDays(scheduled.days)
			);
		});
	}
	else {
		return badStandupResponse(replyFn, message, scheduled.time);
	}

}

function attachListener(controller, rtmBot) {
	controller.hears(['(schedule|create|move)\\s+(?:standup\\s+)?(.*)'],['direct_mention', 'slash_command'], createStandup.bind(null, rtmBot));
	log.verbose('Attached');
}

module.exports = attachListener;
