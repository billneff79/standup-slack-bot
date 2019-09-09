

let log = require('../../getLogger')('start interview');
const { doInterview, getChannelInfoFromMessage, getResponseFunction }  = require('../helpers');

function startInterview(rtmBot, bot, message) {
	log.verbose('Got request to start an interview from '+ message.user);

	getChannelInfoFromMessage(rtmBot, message)
		.then(({ id, mention })  => {
			doInterview(rtmBot, id, mention, message.user);
		})
		.catch(err => {
			let replyFn = getResponseFunction(rtmBot, bot, message, false, true);
			replyFn(message, `I don't know what room you want to interview for.  Try \`/${process.env.SLASH_COMMAND} interview\` from the channel you want to interview for`);
		});

}

function attachListener(controller, rtmBot) {
	controller.hears([/\binterview\b\s*([#<].*)?/i],['direct_mention', 'direct_message', 'slash_command'], (bot, message) => {
		startInterview(rtmBot, bot, message);
	});
}

module.exports = attachListener;
