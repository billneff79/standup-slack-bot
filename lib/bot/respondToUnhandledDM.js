let log = require('../../getLogger')('unhandled message');

function attachListener(controller) {

	let responseText = "Sorry, I don't understand that message.  If you need help, try just saying `help`.";

	controller.hears([/.*/],['direct_message'], (bot, message) => {
		log.info(message.text);
		bot.reply(message, "Sorry, I don't understand that message.  If you need help, try just saying `help`.  If you're trying to submit your standup, try this:\n\nstandup #channelName\nY: what you did yesterday\nT: what you're doing today\nB: blockers\n\n(Each of those fields is optional, so only provide the ones you want!)");
	});

	controller.hears([/.*/],['direct_mention'], (bot, message) => {
		log.info(message.text);
		bot.whisper(message, responseText);
	});

	controller.hears([/.*/], ['slash_command'], (bot, message) => {
		log.info(message.text);
		bot.replyPrivate(message, responseText);
	});
}

module.exports = attachListener;
