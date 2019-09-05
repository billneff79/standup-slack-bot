

let log = require('../../getLogger')('create standup');
let models = require('../../models');
const { time: timeHelper, getResponseFunction }  = require('../helpers');

function setReminder(rtmBot, bot, message) {
	log.verbose('Heard a request to set a standup reminder:\n' + message.match[0]);
	let replyFn = getResponseFunction(rtmBot, bot, message, true);

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
				replyFn(message,
					'Reminder set for '+reminderMinutes+' minutes before the standup');
			});
		}
		else {
			replyFn(message,
				'There\'s no standup scheduled yet. Create one before setting a reminder');
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['remind(er)? (\\d*)'],['direct_mention', 'slash_command'], setReminder.bind(null, rtmBot));
	log.verbose('Attached');
}

module.exports = attachListener;
