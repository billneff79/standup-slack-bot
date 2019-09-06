

let log = require('../../getLogger')('remove standup');
let models = require('../../models');
const {  getResponseFunction }  = require('../helpers');

function removeStandup(rtmBot, bot, message) {
	log.verbose('Heard a request to remove a standup: \n' + message.match[0]);

	let replyFn = getResponseFunction(rtmBot, bot, message, true);

	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel) {
			models.Channel.destroy({
				where: {
					name: message.channel
				}
			}).then(() => {
				log.info('Channel removed: '+channel);
				replyFn(message, 'Standup removed :thumbsup:');
			});
		}
		else {
			replyFn(message, 'This channel doesn\'t have a standup scheduled');
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears([/^\s*(remove|delete)(?:\s*standup\s+)?/],['direct_mention', 'slash_command'], removeStandup.bind(null, rtmBot));
	log.verbose('Attached');
}

module.exports = attachListener;
