

let log = require('../../getLogger')('set in-channel updates');
let models = require('../../models');
const { getResponseFunction }  = require('../helpers');

function toggleUpdates(rtmBot, bot, message, newValue) {
	let replyFn = getResponseFunction(rtmBot, bot, message, true);

	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel) {
			models.Channel.update(
				{
					postUpdatesInChannel: newValue
				},
				{
					where: {
						name: message.channel
					}
				}
			).then(() => {
				replyFn(message, `Okay, I ${newValue ? `will` : `won't`} update the channel with late reports`);
			});
		}
		else {
			replyFn(message,
				'There\'s no standup scheduled for this channel yet!');
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['(en|dis)able updates'],['direct_mention', 'slash_command'], (bot, message) => {
		if (message.match[0].toLowerCase().startsWith('enable')) {
			log.verbose('Heard a request to enable in-channel updates');
			toggleUpdates(rtmBot, bot, message, true);
		}
		else {
			log.verbose('Heard a request to disable in-channel updates');
			toggleUpdates(rtmBot, bot, message, false);
		}
	});
	log.verbose('Attached');
}

module.exports = attachListener;
