

const log              = require('../../getLogger')('channel report');
const reportForUpdate  = require('./reports/forChannelUpdate');
const getLatestReportPermalink = require('./getLastReportPermalink');

module.exports = function updateChannelReport(bot, channel, standups, username) {
	let report = reportForUpdate(channel, standups);

	bot.api.chat.update(report, (err) => {
		if (err) {
			log.error('Error! '+err);
		}
		else {
			log.verbose('Edited the standup for '+channel.name);
			if (channel.postUpdatesInChannel) {
				getLatestReportPermalink(channel, bot)
					.then(permalink =>
						bot.say({
							unfurl_links: false,
							channel: channel.name,
							text: `:bell: I've updated the report with a standup from ${username}: ${permalink}`
						})
					);

			}
		}
	});
};
