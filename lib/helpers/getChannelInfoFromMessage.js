
/**
 *
| Public/Private Room	| Type of Message 	| Result Text					| Message channel (sent from) 	| Message channel_name (sent from)
| Public				| Mention			| <#CKKGE8N6T|techops>			| CN3GMFWKS						| undefined
| Private				| Mention			| #testchannel					| CN3GMFWKS 					| undefined
| Public				| Slash Command		| <#CKKGE8N6T|techops>			| CN3GMFWKS						| testchannel
| Private				| Slash Command		| <#CN3GMFWKS|testchannel		| CN3GMFWKS						| testchannel
| Public				| Direct			| <#CKKGE8N6T|techops>			| DN0BWMFK7						| undefined
| Private				| Direct			| #testchannel					| DN0BWMFK7						| undefined
**/

const knownNames = {};
const knownIDs = {};

function updateCache(channelName, channelId) {
	knownNames[channelName] = channelId;
	knownIDs[channelId] = channelName;
	return true;
}

function createResponse(id, name) {
	return { id, name, mention: `<#${id}|${name}>` };
}


/**
 * Get a channel mention with fallback text (needed for private channels) from a message.  If the message includes a channel mention (or attempt at one),
 * it will use that, otherwise it will use the channel the message was sent from.
 *
 * @returns {Promise<*>} A promise the resolves to an object containing name, id, and mention for the channel.  Will reject if couldn't find/infer info
 */
function getChannelInfoFromMessage(rtmBot, message) {
	let channelId,channelName;

	//some messages, like emoji reactions, have no text
	if (message.item) {
		message.text = '';
		message.channel = message.item.channel;
	}

	//some events (e.g. message_changes) have a message field where the new  message is
	if (message.message) {
		message.text = message.message.text;
	}

	// slack automatically encodes public channel names, and private ones in slash commands, .e.g <#CKKG6T|foo-stuff>
	let matchResults = message.text.match(/<#([^|]+)\|([^>]+)>/);
	if (matchResults) {
		[,channelId, channelName] = matchResults;
		updateCache(channelName, channelId);
	}
	//if it isn't encoded, and we just get #foo-stuff, likely a private channel, so see if we have it in our private channel cache
	else if ((matchResults = message.text.match(/\B#([^\s]+)/))) {
		channelName = matchResults[1].toLowerCase();
		channelId = knownNames[channelName];
	}

	if (channelName) {
		//If we have a name and ID, we can just return, otherwise try to look up the likely private #channel id by its name
		return channelId ? Promise.resolve(createResponse(channelId, channelName)) :
			new Promise((resolve, reject) =>
				rtmBot.api.conversations.list({ limit: 10000, exclude_archived: true, types: 'private_channel' }, (err, privateChannels) => {
					if (err) return reject(err);
					(privateChannels.channels || []).some(({ id, name }) => name === channelName && updateCache(channelName, channelId = id));
					channelId ? resolve(createResponse(channelId, channelName)) : reject(`Could not find channel id for #${channelName}`);
				}));
	}

	//no channel name, so assume it is for the sending room (ignoring direct messages)
	if (message.type === 'direct_message') {
		return Promise.reject('Cannot get room mention for direct messages');
	}

	//Try to get the channelName by looking up the conversation info
	channelId = message.channel;
	channelName = message.channel_name || knownIDs[channelId];
	return channelName ? Promise.resolve(createResponse(channelId, channelName)) :
		//get channel name from conversations api
		new Promise((resolve, reject) =>
			rtmBot.api.conversations.info({ channel: channelId }, (err, channelInfo) => {
				if (err) return reject(err);
				channelName = channelInfo.channel && channelInfo.channel.name;
				channelName ? resolve(createResponse(channelId, channelName)) : reject(`Could not find channel name for id ${channelId}`);
			}));
}


module.exports = getChannelInfoFromMessage;
