

let log = require('../../getLogger')('emoji response');
let models = require('../../models');
let helpers = require('../helpers');

function startDmEmoji(bot, message) {
	models.Channel.findOne({ where: { name: message.item.channel } })
		.then((channel) => {
			if (channel) {
				log.verbose(`Got an emoji reaction: ${message.reaction} from ${message.user}`);
				helpers.doInterview(bot, message.item.channel, message.user);
			}
		});
}

function attachListener(controller, botId) {
	controller.on('reaction_added', (bot, message) => {
		if (message.item_user === botId && message.user !== botId) {
			startDmEmoji(bot, message);
		}
	});
}

module.exports = attachListener;
