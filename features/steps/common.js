const { After, Given, Then } = require('cucumber');
let sinon = require('sinon');
let models = require('../../models');

Given('the bot is running', () => {
	module.exports.botController = { };
	module.exports.handlerMatchers = [];
	module.exports.botController.hears = sinon.stub().callsFake((matchers, messageTypes, handler) => {
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
		module.exports.handlerMatchers.push(testFn);
	});

	module.exports.botController.on = sinon.stub().callsFake((messageTypes, handler) => {
		if (!Array.isArray(messageTypes)) messageTypes = [messageTypes];
		//convert each matcher to a regexp
		let testFn = (message) => messageTypes.includes(message.type) && [handler];
		module.exports.handlerMatchers.push(testFn);
	});

	require('../../lib/helpers/doInterview').flush();

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
			}
		}
	};

	let webhookBot = {
		replyAcknowledge: sinon.spy(),
		replyPublicDelayed: sinon.spy(),
		replyPrivateDelayed: sinon.spy()
	};

	module.exports.rtmBot = bot;
	module.exports.webhookBot = webhookBot;

	module.exports.botController.hears.__bot = bot;
	module.exports.botController.on.__bot = bot;
});

Given('I am in a room with the bot', () => {

});

Then(/the bot should not respond/, () => {
	const bot = module.exports.botController.hears.__bot;
	return (!bot.reply.called && !bot.say.called && !bot.startPrivateConversation.called);
});

function thenBotShouldRespond(isWebhook, isPrivate, responseContains) {
	let responseBot = module.exports[isWebhook ? 'webhookBot' : 'rtmBot'];
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
	// console.log(botReply);
	throw new Error(`Actual Response: ${botReply}`);

}

Then(/the (webhook )?bot should (privately )?respond "([^"]+)"/, (isWebhook, isPrivate, responseContains) => thenBotShouldRespond(isWebhook, isPrivate, responseContains));

Then(/the (webhook )?bot should (privately )?respond$/, (isWebhook, isPrivate, responseContains) => thenBotShouldRespond(isWebhook, isPrivate, responseContains));

Then(/the bot should start a private message with "([^"]+)"/, (responseContains) => {
	const bot = module.exports.botController.on.__bot;

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
	throw new Error('Bot reply did not contain "' + responseContains + '"');

});

Then(/the bot should start a private message with an attachment saying "([^"]+)"/, (responseContains) => {
	const bot = module.exports.botController.on.__bot;

	if (bot.say.called) {
		const msg = bot.say.args[bot.say.args.length - 1][0];
		if ((msg.attachments || []).some(({ fields }) => fields.some(field => field.value.indexOf(responseContains) >= 0))) return true;
		throw new Error(`Bot reply did not contain an attachment saying "${responseContains}"`);
	}
	else {
		throw new Error(`Bot did not say anything`);
	}


});

Then('the bot should upload a post', () => {
	const bot = module.exports.botController.on.__bot;

	if (bot.api.files.upload.called && bot.api.files.upload.args.length > 0) {
		const file = bot.api.files.upload.args[0][0];
		if (file && file.filetype === 'post') {
			return true;
		}
		throw new Error('Bot did not upload a post');

	}

	throw new Error('Bot did not upload anything');
});

let _standupFindStub;
Given(/I( do not)? have previous standups/, (dont) => {
	let todayDate = new Date();
	let yesterdayDate = new Date(new Date() - 24 * 60 * 60 * 1000);

	_standupFindStub = sinon.stub(models.Standup, 'findAll');
	if (dont) {
		_standupFindStub.resolves([ ]);
	}
	else {
		_standupFindStub.resolves([
			{
				date: todayDate.toISOString(),
				yesterday: 'Did a thing',
				today: 'Doing a thing',
				blockers: 'Nothing',
				goals: 'Something'
			},
			{
				date: yesterdayDate.toISOString(),
				yesterday: 'Did a different thing',
				today: 'Doing another thing',
				blockers: 'Something',
				goals: 'Everything'
			}
		]);
	}
});

After(() => {
	if (_standupFindStub) {
		_standupFindStub.restore();
		_standupFindStub = null;
	}
});

module.exports.botController = null;
module.exports.rtmBot = null;

function getHandlerAndMatches(message) {
	let result;
	module.exports.handlerMatchers.some(testFn => result = testFn(message));
	return result;
}

module.exports.botReceivesMessage = (message, messageType='direct_mention', done) => {
	if (!message.type) message.type = messageType;

	let [handler, messageMatches] = getHandlerAndMatches(message);
	message.match = messageMatches;
	handler(module.exports[messageType === 'slash_command' ? 'webhookBot' : 'rtmBot'], message);
	done && done();
};

module.exports.botRepliesToHearing = function(message, done, messageType) {
	module.exports.botReceivesMessage(message, messageType);
	waitForResponseFn('rtmBot', 'reply', done);
};

module.exports.botWhispersToHearing = function(message, done, messageType) {
	module.exports.botReceivesMessage(message, messageType);
	waitForResponseFn('rtmBot', 'whisper', done);
};

module.exports.webhookBotPrivateReplyToHearing = function(message, done, messageType) {
	module.exports.botReceivesMessage(message, messageType);
	waitForResponseFn('webhookBot', 'replyPrivateDelayed', done);
};

module.exports.botStartsConvoWith = function(message, done, messageType) {
	module.exports.botReceivesMessage(message, messageType);
	waitForResponseFn('rtmBot', 'startPrivateConversation', done);

};

function waitForResponseFn(waitBot, waitMethod, done) {
	let waitFn = () => module.exports[waitBot][waitMethod].called;
	module.exports.wait(waitFn).then(() => {
		done();
	}).catch(() => {
		//call done with an error - see if you can figure out if any methods were called
		let rtmBotMethodsCalled = ['reply', 'startTyping', 'whisper', 'startPrivateConversation', 'say'].filter(method =>
			module.exports.rtmBot[method].called
		).join(', ');
		let webhookBotMethodsCalled =
		['replyAcknowledge', 'replyPublicDelayed', 'replyPrivateDelayed'].filter(method =>
			module.exports.webhookBot[method].called
		).join(', ');

		let methodsCalledMessage = '';
		if (rtmBotMethodsCalled) {
			methodsCalledMessage = `rtmBot Methods Called: ${rtmBotMethodsCalled}`;
		}
		if (webhookBotMethodsCalled) {
			methodsCalledMessage += `${rtmBotMethodsCalled ? '\n' : ''}webhookBot Methods Called: ${rtmBotMethodsCalled}`;
		}

		done(`Expected ${'rtmBot.startPrivateConversation'} to be called, but it wasn't.  ${methodsCalledMessage}`);

	});
}


/**
 * Wait max of 100ms
 */
module.exports.wait = function wait(until) {
	let start = Date.now();
	return new Promise((resolve, reject)  => {
		function test() {
			if (Date.now()-start > 100) return reject();
			until() ? resolve() : setTimeout(test, 10);

		}
		test();
	});

};
