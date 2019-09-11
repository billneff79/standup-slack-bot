/**
 * Return the appropriate function that should be used to respond to the message
 * @param {*} rtmBot The rtm bot from system startup
 * @param {*} bot The bot passed from the handler
 * @param {*} message The message object from the handler
 * @param {Boolean} [isSlashReponsePublic=false] Whether the response to a slash command should be public `true` or private `false` [default]
 * @param {Boolean} [isMentionResponsePrivate=false] Whether the response to a mention should be private `true` or public `false` [default]
 * * @param {Boolean} [isDMPrivate=false] Whether the response to a direct message should be private `true` or public `false` [default]
 */
function getResponseFunction(rtmBot, bot, message, isSlashReponsePublic, isMentionResponsePrivate, isDMPrivate)  {
	if (message.type === 'slash_command') {
		//if a slash command, ack immediately
		bot.replyAcknowledge();
		return isSlashReponsePublic ? bot.replyPublicDelayed : bot.replyPrivateDelayed;
	}
	else if (message.channel[0] === 'D') {
		rtmBot.startTyping(message);
		return isDMPrivate ? rtmBot.whisper : rtmBot.reply;
	}

	//for direct mentions if response shouldn't be private, show typing indicator
	!isMentionResponsePrivate && rtmBot.startTyping(message);
	return isMentionResponsePrivate ? rtmBot.whisper : rtmBot.reply;

}
module.exports = getResponseFunction;
