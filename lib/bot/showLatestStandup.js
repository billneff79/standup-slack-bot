

let models = require('../../models');
const { getLatestReportPermalink, getResponseFunction }  = require('../helpers');


function ShowLatestStandup(rtmBot, bot, message) {
	let replyFn = getResponseFunction(rtmBot, bot, message);
	models.Channel.findOne({
		where: {
			name: message.channel
		}
	})
		.then((channel) => getLatestReportPermalink(channel, rtmBot))
		.then(permalink => {
			if (!permalink) {
				replyFn(message, `No standups have been run in ${message.channel} yet`);
			}
			else {
				message.unfurl_links=false; //don't automatically show the standup in the main channel
				replyFn(message, `Most recent standup: ${permalink}`);
			}
		});
}

function attachListener(controller, rtmBot) {
	controller.hears(['^(where|show|latest)'],['direct_mention', 'slash_command'], ShowLatestStandup.bind(null, rtmBot));
}

module.exports = attachListener;
