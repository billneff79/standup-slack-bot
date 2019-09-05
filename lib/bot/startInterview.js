

let log = require('../../getLogger')('start interview');
let helpers = require('../helpers');

function startDmEmoji(bot, message) {
	log.verbose('Got request to start an interview from '+message.user);
	helpers.doInterview(bot, message.channel, message.user);
}

function attachListener(controller, rtmBot) {
	controller.hears([/\binterview\b/i],['direct_mention', 'slash_command'], (bot, message) => {
		startDmEmoji(rtmBot, message);
	});
}

module.exports = attachListener;
