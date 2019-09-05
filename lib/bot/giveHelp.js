
const { getResponseFunction }  = require('../helpers');

function attachListener(controller, rtmBot) {
	controller.hears(['^(help|usage)'],['direct_mention','direct_message', 'slash_command'], (bot, message) => {
		let replyFn =  getResponseFunction(rtmBot, bot, message, false, true);
		replyFn(message, `Check out my <${process.env.PUBLIC_URL}|full standup-bot documentation>`);
	});
}

module.exports = attachListener;
