
const { getResponseFunction }  = require('../helpers');

function attachListener(controller, rtmBot) {
	controller.hears(['^(help|usage)'],['direct_mention','direct_message', 'slash_command'], (bot, message) => {
		let replyFn =  getResponseFunction(rtmBot, bot, message, false, true, true);
		replyFn(message, `Check out my <${process.env.PUBLIC_URL}|full standup-bot documentation>.  Common commands:\n\`/${process.env.SLASH_COMMAND} create standup 10:00 am\`\n\`/${process.env.SLASH_COMMAND} reminder 15 minutes before standup\`\n\`/${process.env.SLASH_COMMAND} interview\``);
	});
}

module.exports = attachListener;
