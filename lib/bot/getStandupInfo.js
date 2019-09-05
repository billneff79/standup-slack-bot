

let models = require('../../models');
let timeHelper = require('../helpers').time;

function GetStandupInfo(rtmBot, bot, message) {
	let isSlash = message.type === 'slash_command';
	//if a slash command, ack immediately
	isSlash ? bot.replyAcknowledge() :  rtmBot.startTyping(message);
	let replyFn =  isSlash ? bot.replyPrivateDelayed : rtmBot.reply;

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
