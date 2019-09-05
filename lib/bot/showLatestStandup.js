

let models = require('../../models');

function ShowLatestStandup(rtmBot, bot, message) {
	let isSlash = message.type === 'slash_command';
	//if a slash command, ack immediately
	isSlash ? bot.replyAcknowledge() :  rtmBot.startTyping(message);
	let replyFn =  isSlash ? bot.replyPrivateDelayed : rtmBot.reply;

	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel.latestReport) {
			rtmBot.api.callAPI('chat.getPermalink', {
				channel: message.channel,
				message_ts: channel.latestReport
			}, (err,permalink) => {
				if (err || !permalink.ok) {
					replyFn(message, `Error looking up latest standup report: ${err}`);
				}
				else {
					message.unfurl_links=false; //don't automatically show the standup in the main channel
					replyFn(message, `Most recent standup: ${permalink.permalink}`);
				}
			});

		}
		else {
			replyFn(message, `No standups have been run in ${message.channel} yet`);
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['^(where|show|latest)'],['direct_mention', 'slash_command'], ShowLatestStandup.bind(null, rtmBot));
}

module.exports = attachListener;
