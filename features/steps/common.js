const { After, AfterAll, Before, Given, Then } = require('cucumber');
let sinon = require('sinon');
let models = require('../../models');
let helpers = require('../../lib/helpers');
let moment = require('moment');
const dlv = require('dlv');

let logOpenTimers = require('why-is-node-running');


/**
 * Setup the sinon sandbox and a bunch of helper functions to be used by other steps with the "this" context set appropriately
 */
Before(function () {
	this.sandbox = sinon.createSandbox();

	const getHandlerAndMatches = (message) => {
		let result;
		this.handlerMatchers.some(testFn => result = testFn(message));
		return result;
	};

	this.botReceivesMessage = (message, messageType='direct_mention', done) => {
		if (!message.type) message.type = messageType;

		let [handler, messageMatches] = getHandlerAndMatches(message);
		message.match = messageMatches;
		handler(this[messageType === 'slash_command' ? 'webhookBot' : 'rtmBot'], message);
		done && done();
	};

	this.botRepliesToHearing = (message, done, messageType) => {
		this.botReceivesMessage(message, messageType);
		waitForResponseFn(['rtmBot.say', 'rtmBot.reply', 'rtmBot.startPrivateConversation', 'rtmBot.whisper'], done);
	};

	this.webhookBotRepliesToHearing= (message, done, messageType) => {
		this.botReceivesMessage(message, messageType);
		waitForResponseFn(['webhookBot.replyPrivateDelayed', 'webhookBot.replyPublicDelayed'], done);
	};


	/**
 * Wait max of 100ms
 */
	this.wait = (until) => {
		let start = Date.now();
		return new Promise((resolve, reject)  => {
			function test() {
				if (Date.now()-start > 100) return reject();
				until() ? resolve() : setTimeout(test, 10);

			}
			test();
		});
	};

	const waitForResponseFn = (spies, done) => {
		if (typeof done !== 'function') {
			console.error('No Done!');
		}
		let waitFn = () => spies.some(s => dlv(this, `${s}.called`));
		this.wait(waitFn).then(() => {
			done();
		}).catch(() => {
		//call done with an error - see if you can figure out if any methods were called
			let rtmBotMethodsCalled = ['reply', 'startTyping', 'whisper', 'startPrivateConversation', 'say'].filter(method =>
				this.rtmBot[method].called
			).join(', ');
			let webhookBotMethodsCalled =
		['replyAcknowledge', 'replyPublicDelayed', 'replyPrivateDelayed'].filter(method =>
			this.webhookBot[method].called
		).join(', ');

			let methodsCalledMessage = '';
			if (rtmBotMethodsCalled) {
				methodsCalledMessage = `rtmBot Methods Called: ${rtmBotMethodsCalled}`;
			}
			if (webhookBotMethodsCalled) {
				methodsCalledMessage += `${rtmBotMethodsCalled ? '\n' : ''}webhookBot Methods Called: ${rtmBotMethodsCalled}`;
			}

			done(`Expected one of [${spies.join(', ')}] to be called, but none were.  ${methodsCalledMessage}`);

		});
	};

});

After(function() {
	//flush out any leftover interviews and reminder timers
	helpers.doInterview.flush();

	this.sandbox.restore();
});

AfterAll(() => {
	//print out the reason any timers are still running or promises are still waiting to resolve, if there are any
	setTimeout(() => {
		let consoleErrorSpy = sinon.spy();
		logOpenTimers({
			error: consoleErrorSpy
		});
		//The second argument of the first call tells us how many open handles there are.  If there is only 1
		//it is this timer and we don't care.  If it's more than one, really log to the console what is blocking
		if (consoleErrorSpy.called && consoleErrorSpy.firstCall.args[1] > 1) {
			logOpenTimers();
		}
	}, 10);
});

Given('the bot is running', function() {

	this.PUBLIC_CHANNEL = {
		id: 'CPublic',
		isPublic: true,
		name: 'publicRoom',
		mention: '<#CPublic|publicRoom>'
	};
	this.PRIVATE_CHANNEL= {
		id: 'CPrivate',
		isPublic: false,
		name: 'privateRoom',
		mention: '#privateRoom'
	};
	this.OTHER_CHANNEL = {
		id: 'COtherChannel',
		isPublic: true,
		name: 'otherRoom',
		mention: '<#COtherChannel|otherRoom'
	};

	this.DM_CHANNEL = {
		id: 'DPrivate',
		name: 'standup_bot'
	};

	this.USER_ID = 'U7654321';

	const ALL_CHANNELS = {
		[this.PUBLIC_CHANNEL.id]: this.PUBLIC_CHANNEL,
		[this.PRIVATE_CHANNEL.id]: this.PRIVATE_CHANNEL,
		[this.OTHER_CHANNEL.id]: this.OTHER_CHANNEL,
		[this.DM_CHANNEL.id]: this.DM_CHANNEL
	};

	this.getChannelByType = (channelType) => !channelType ? this.channel :
		channelType === 'public' ? this.PUBLIC_CHANNEL : channelType === 'private' ? this.PRIVATE_CHANNEL : this.OTHER_CHANNEL;

	this.botController = { };
	this.handlerMatchers = [];
	this.botController.hears = sinon.stub().callsFake((matchers, messageTypes, handler) => {
		if (!Array.isArray(matchers)) matchers = [matchers];
		if (!Array.isArray(messageTypes)) messageTypes = [messageTypes];
		//convert each matcher to a regexp
		matchers = matchers.map(m => m.test ? m : new RegExp(m));
		let testFn = (message) => {
			if (!messageTypes.includes(message.type)) return;
			let matchResult;
			matchers.some(r => matchResult = message.text.match(r));
			return matchResult && [handler, matchResult];
		};
		this.handlerMatchers.push(testFn);
	});

	this.botController.on = sinon.stub().callsFake((messageTypes, handler) => {
		if (!Array.isArray(messageTypes)) messageTypes = [messageTypes];
		//convert each matcher to a regexp
		let testFn = (message) => messageTypes.includes(message.type) && [handler];
		this.handlerMatchers.push(testFn);
	});

	let bot = {
		reply: sinon.spy(),
		startTyping: sinon.spy(),
		whisper: sinon.spy(),
		startPrivateConversation: sinon.spy(),
		say: sinon.spy(),
		utterances: {
			yes: '',
			no: ''
		},
		api: {
			users: {
				info: sinon.stub().yields(null, { user: { real_name: 'Bob the Tester', profile: { image_72: 'thumbnail.png' } } })
			},
			team: {
				info: sinon.stub().yields(null, { team: { name: 'CSomethingSaySomething' } })
			},
			chat: {
				update: sinon.stub().yields(null, {})
			},
			channels: {
				info: sinon.stub().yields(null, { channel: { name: 'CSomethingSaySomething' } })
			},
			files: {
				upload: sinon.stub().yields(null, {})
			},
			conversations: {
				list: sinon.stub().callsFake((opts={}, cb) => {
					let response = {
						ok: true,
						channels: []
					};
					if (!opts.types || /public_channel/.test(opts.types)) response.channels.push(this.PUBLIC_CHANNEL, this.OTHER_CHANNEL);
					if (/private_channel/.test(opts.types)) response.channels.push(this.PRIVATE_CHANNEL);
					cb(null, response);
				}),
				info: sinon.stub().callsFake(({ channel: channelId }, cb) => {
					let channel = ALL_CHANNELS[channelId];
					cb(null, {
						ok: !!channel,
						channel
					});
				})
			}
		}
	};

	let webhookBot = {
		replyAcknowledge: sinon.spy(),
		replyPublicDelayed: sinon.spy(),
		replyPrivateDelayed: sinon.spy()
	};

	this.rtmBot = bot;
	this.webhookBot = webhookBot;

	this.existingChannels = [];
	this.existingStandups = [];

	let filterChannels = ({ where }) => {
		let result = [...this.existingChannels];
		Object.keys(where).forEach(condition => {
			result = result.filter(c => c[condition] === where[condition]);
		});
		return Promise.resolve(result);
	};

	let filterStandups = ({ where: { channel, user, date } }) => {
		let result = [...this.existingStandups];
		if (channel) result = result.filter(s => s.channel === channel);
		if (user) result = result.filter(s => s.user === user);
		if (date) result = result.filter(s => {
			let d = new Date(s.date).getTime();
			if (typeof date === 'string') return d === new Date(date).getTime();
			let { $gt, $lte, $lt, $gte } = date;
			return (!$gt || d > $gt.getTime()) && (!$gte || d >= $gte.getTime())
				|| (!$lt || d < $lt.getTime()) || (!$lte || d <= $lte.getTime());
		});
		return Promise.resolve(result);
	};

	//stub out response for models.Channel.findOne and models.Standup.findAll and models.Standup.findOne based
	//on how existingChannels and existingStandups is populated
	this.sandbox.stub(models.Channel, 'findAll').callsFake(filterChannels);
	this.sandbox.stub(models.Channel, 'findOne').callsFake((opts) => filterChannels(opts).then(channels => channels[0]));
	this.sandbox.stub(models.Channel, 'findOrCreate').callsFake((opts) => filterChannels(opts).then(channels => {
		if (channels.length) return channels;
		this.existingChannels.push(opts.where);
		return [opts.where];
	}));
	this.sandbox.stub(models.Channel, 'update').callsFake((channelUpdates, opts) =>  filterChannels(opts).then(channels => {
		if (!channels.length) return;
		return Object.assign(channels[0], channelUpdates);
	}));

	this.sandbox.stub(models.Standup, 'findAll').callsFake(filterStandups);
	this.sandbox.stub(models.Standup, 'findOne').callsFake(opts => filterStandups(opts).then(s => s[0]));
	this.sandbox.stub(models.Standup, 'findOrCreate').callsFake((opts) => filterStandups(opts).then(s => {
		if (s.length) return s;
		this.existingStandups.push(opts.where);
		return [opts.where];
	}));
	this.sandbox.stub(models.Standup, 'update').callsFake((standupUpdates, opts) =>  filterStandups(opts).then(s => {
		if (!s.length) return;
		return Object.assign(s[0], standupUpdates);
	}));

});

Given(/I am in a (public|private|other) room with the bot/, function (channelType)   {
	this.channel = this.getChannelByType(channelType);
	(this.message || (this.message={})).channel = this.channel.id;
});

Given(/the (?:(public|private|other) channel )?standup is scheduled for ([1-2]?\d:[0-5]\d [ap]m)(?:(?: on )(.*))?/, function (channelType, time, days) {
	let channel = this.getChannelByType(channelType);
	let c = {
		name: channel.id,
		time: helpers.time.getScheduleFormat(moment(time, 'h:mm a')),
		// add keys for days of week, like "monday: true"
		...(days || '').split(' ').reduce((acc, d) => (acc[d.toLowerCase()] = true, acc), {})
	};
	c.get = (key) => c[key];

	this.existingChannels.push(c);
});

Given(/^the (?:(public|private|other) )?channel (does(?: not)?) have a standup/, function (channelType, status) {
	let channel = this.getChannelByType(channelType);
	let hasStandup = status === 'does';
	if (!hasStandup) {
		this.existingChannels = this.existingChannels.filter(c => c.name !== channel.id);
	}
	else {
		this.existingChannels.push({
			time: '0130',
			name: channel.id,
			latestReport: '123467.01',
			[helpers.time.getScheduleDay()]: true
		});

	}

	// this.sandbox.stub(models.Standup, 'findOne').resolves(hasStandup ? {
	// 	user: 'U00000000',
	// 	userRealName: 'Bob the Tester',
	// 	yesterday: 'In the past',
	// 	today: 'Now',
	// 	blockers: 'Barricades',
	// 	goal: 'Accomplishments-to-be'
	// } : undefined);
});

//assume this.channel if no channel specified
Given(/no standup is scheduled(?: for the (public|private|other) channel)?/, function(channelType)  {
	let channel = this.getChannelByType(channelType);
	//remove any standup for the specified channel
	this.existingChannels = this.existingChannels.filter(c => c.name !== channel.id);
});

Given(/I am in a DM with the bot/, function (publicPrivate)   {
	this.channel = this.DM_CHANNEL;
	(this.message || (this.message={})).channel = this.channel.id;
});

Given(/I( do not)? have previous standup reports(?: for (public|private|other) channel)?/, function (dont, channelType) {
	let channel = this.getChannelByType(channelType);

	if (dont) {
		this.existingStandups = this.existingStandups.filter(s => s.user !== this.USER_ID || s.channel !== channel.id);
	}
	else {
		this.existingStandups.push({
			user: this.USER_ID,
			channel: channel.id,
			date: helpers.time.getReportFormat(),
			yesterday: 'Did a thing',
			today: 'Doing a thing',
			blockers: 'Nothing',
			goals: 'Something'
		},
		{
			user: this.USER_ID,
			channel: channel.id,
			date: helpers.time.getReportFormat(new Date() - 24 * 60 * 60 * 1000),
			yesterday: 'Did a different thing',
			today: 'Doing another thing',
			blockers: 'Something',
			goals: 'Everything'
		});
	}

});

Given(/the bot knows the mention for the (public|private|other) channel/, function (channelType) {
	//For private channels, the bot doesn't always get the mention for the room
	//this "Given" presumes that we've seen it in some other call and have cached it so it is available
	let channel = this.getChannelByType(channelType);
	channel.mention = `<#${channel.id}|${channel.name}>`;
});


Then(/the bot should not respond/, function () {
	const bot = this.rtmBot;
	return (!bot.reply.called && !bot.say.called && !bot.startPrivateConversation.called);
});

function thenBotShouldRespond(isWebhook, isPrivate, responseContains) {
	let responseBot = this[isWebhook ? 'webhookBot' : 'rtmBot'];
	let responseMethod = isWebhook ?
		isPrivate ? 'replyPrivateDelayed' : 'replyPublicDelayed'
		: isPrivate ? 'whisper' : 'reply';
	let botReply = responseBot[responseMethod].args[0][1];

	if (typeof botReply === 'object' && (botReply.text || botReply.attachments[0].fallback)) {
		botReply = botReply.text || botReply.attachments[0].fallback;
	}

	if (new RegExp(responseContains).test(botReply)) {
		return true;
	}
	throw new Error(`Actual Response: ${botReply}`);

}

//eslint-disable-next-line prefer-arrow-callback
Then(/the (webhook )?bot should (privately )?respond "([^"]+)"/, function (isWebhook, isPrivate, responseContains)  {
	return thenBotShouldRespond.call(this, isWebhook, isPrivate, responseContains);
});


//eslint-disable-next-line prefer-arrow-callback
Then(/the (webhook )?bot should (privately )?respond$/, function (isWebhook, isPrivate, responseContains) {
	return thenBotShouldRespond.call(this, isWebhook, isPrivate, responseContains);
});

Then(/the bot should start a private message with "([^"]+)"/, function (responseContains)  {
	const bot = this.rtmBot;

	// First check if bot.say was called.  If it was, then the bot may have
	// sent a DM.  Check for that.
	if (bot.say.called) {
		const msg = bot.say.args[bot.say.args.length - 1][0];
		// If the target channel is a user, then it's a DM
		if (msg.channel[0] === 'U') {
			if (msg.text.indexOf(responseContains) >= 0) {
				return true;
			}
			// console.log(msg.text);
			throw new Error('Bot reply did not contain "' + responseContains + '"');

		}
	}

	// If the bot didn't send a DM, then we should check if it started a
	// private conversation and sent a message that way.

	let convo = {
		say: sinon.spy(),
		ask: sinon.spy(),
		on: sinon.spy()
	};

	let DmReply = bot.startPrivateConversation.args[0][1];
	DmReply('nothing', convo);

	let botResponse = convo.say.called ? convo.say : convo.ask;
	DmReply = botResponse.args[0][0];

	if (DmReply.indexOf(responseContains) >= 0) {
		return true;
	}
	throw new Error('Bot reply did not contain "' + responseContains + '".\nActual:' + DmReply);

});

Then(/the bot should start a private message with an attachment saying "([^"]+)"/, function (responseContains)  {
	const bot = this.rtmBot;

	if (bot.say.called) {
		const msg = bot.say.args[bot.say.args.length - 1][0];
		if ((msg.attachments || []).some(({ fields }) => fields.some(field => field.value.indexOf(responseContains) >= 0))) return true;
		throw new Error(`Expected bot response to start with "${responseContains}"\nActual: "${JSON.stringify(msg, null, 2)}`);
	}
	else {
		throw new Error(`Bot did not say anything`);
	}


});

Then('the bot should upload a post', () => {
	const bot = this.rtmBot;

	if (bot.api.files.upload.called && bot.api.files.upload.args.length > 0) {
		const file = bot.api.files.upload.args[0][0];
		if (file && file.filetype === 'post') {
			return true;
		}
		throw new Error('Bot did not upload a post');

	}

	throw new Error('Bot did not upload anything');
});

