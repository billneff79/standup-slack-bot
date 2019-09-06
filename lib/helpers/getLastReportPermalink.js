/**
 * Get the permalink for the most recent posted standup report thread in a channel
 * @param {*} channel A channel model
 * @param {*} bot The rtmBot used for making api requests
 * @returns {Promise<string|void>} Returns a promise that resolves to empty if there is no latestReport, or the permalink from slack if found
 */
module.exports = function(channel, rtmBot) {
	return !channel.latestReport ? Promise.resolve() :
		new Promise((resolve, reject) => {
			rtmBot.api.callAPI('chat.getPermalink', {
				channel: channel.name,
				message_ts: channel.latestReport
			}, (err,permalink) => {
				if (err || !permalink.ok) {
					reject(`Error getting permalink: ${err}`);
				}
				else {
					resolve(permalink.permalink);
				}
			});
		});

};
