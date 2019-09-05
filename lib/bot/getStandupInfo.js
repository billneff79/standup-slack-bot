

let models = require('../../models');
const { time: timeHelper, getResponseFunction }  = require('../helpers');

function GetStandupInfo(rtmBot, bot, message) {
	let replyFn = getResponseFunction(rtmBot, bot, message);

	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel) {
			let responseText = `There's a standup scheduled for ${timeHelper.getDisplayFormat(channel.time)} on ${timeHelper.getDisplayFormatForDaysOfChannel(channel)}.`;
			if (channel.reminderMinutes) {
				let reminderSuffix = channel.audience ? ` that mentions ${channel.audience}.` : '.';
				responseText += `  A reminder will be sent out ${channel.reminderMinutes} minutes before${reminderSuffix}`;
			}
			replyFn(message, responseText);
		}
		else {
			replyFn(message, 'There\'s no standup scheduled yet.');
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['^when'],['direct_mention', 'slash_command'], GetStandupInfo.bind(null, rtmBot));
}

module.exports = attachListener;
