const { Before, After, When } = require('cucumber');
let sinon = require('sinon');
let models = require('../../models');
let botLib = require('../../lib/bot');
let common = require('./common');
let helpers = require('../../lib/helpers');

let sandbox;

Before(() => {
	sandbox = sinon.createSandbox();
});

function stubGetChannelInfoFromMessage() {
	if (helpers.getChannelInfoFromMessage.isSinonProxy) return;
	sandbox.stub(helpers, 'getChannelInfoFromMessage').callsFake((bot, message) => {
		let name = `name-${message.channel}`;
		return Promise.resolve({ id: message.channel, mention: `<#${message.channel}|${name}>`, name });
	});
}

When('I am already being interviewed for another channel', (done) => {
	botLib.startInterview(common.botController, common.rtmBot);

	const message = {
		user: 'U7654321',
		text: '@bot interview me',
		channel: 'COtherChannel'
	};

	stubGetChannelInfoFromMessage();
	sandbox.stub(models.Standup, 'findAll').resolves([ ]);
	sandbox.stub(models.Channel, 'findOne').resolves({ time: '1230', name: message.channel, audience: null });

	common.botStartsConvoWith(message, restoreModelStubsAndCallDone(done));
});

When(/I say "@bot\b.*(\binterview\b.*)"/,
	(interviewText, done) => {
		botLib.startInterview(common.botController, common.rtmBot);

		let message = { };

		message.user = 'U7654321';
		message.text = interviewText;
		message.channel ='CSomethingSaySomething';

		stubGetChannelInfoFromMessage();
		sandbox.stub(models.Standup, 'findAll').resolves([ ]);
		sandbox.stub(models.Channel, 'findOne').resolves({ time: '1230', name: message.channel, audience: null });
		common.botStartsConvoWith(message, restoreModelStubsAndCallDone(done));
	});

After(() => {
	sandbox.restore();
});

const restoreModelStubsAndCallDone = (done) => () => {
	models.Standup.findAll.restore();
	models.Channel.findOne.restore();
	done();
};
