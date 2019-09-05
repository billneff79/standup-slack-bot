

let log = require('../../getLogger')('create standup');
let models = require('../../models');
let timeHelper = require('../helpers').time;

function setReminder(bot, message) {
	log.verbose('Heard a request to set a standup reminder:\n' + message.match[0]);
	let reminderMinutes = message.match[2];
	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel) {
			let reminderTime = timeHelper.getReminderFormat(channel.time, reminderMinutes);
			models.Channel.update(
				{
					reminderMinutes,
					reminderTime
				},
				{
					where: {
						name: message.channel
					}
				}
			).then(() => {
				bot.reply(message,
					'Got it. Reminder set for '+reminderMinutes+' minutes before the standup');
			});
		}
		else {
			bot.reply(message,
				'There\'s no standup scheduled yet. Create one before setting a reminder');
		}
	});
}

function attachListener(controller) {
	controller.hears(['remind(er)? (\\d*)'],['direct_mention'], setReminder);
	log.verbose('Attached');
}

module.exports = attachListener;
