
function attachListener(controller, botName, rtmBot) {
	controller.hears(['^(help|usage)'],['direct_mention','direct_message', 'slash_command'], (bot, message) => {
		let isSlash = message.type === 'slash_command';
		//if a slash command, ack immediately
		isSlash && bot.replyAcknowledge();
		let replyFn =  isSlash ? bot.replyPrivateDelayed : rtmBot.whisper;

		if (process.env.PUBLIC_URL) {
			replyFn(message, `Check out my <${process.env.PUBLIC_URL}|full standup-bot documentation>: ${process.env.PUBLIC_URL}`);
		}
	});
}

module.exports = attachListener;
