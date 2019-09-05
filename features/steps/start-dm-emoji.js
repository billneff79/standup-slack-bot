

let sinon = require('sinon');
let botLib = require('../../lib/bot');
let common = require('./common');
let models = require('../../models');
let helpers = require('../../lib/helpers');

module.exports = function() {
	let _message = { };
	let now;
	_message.item = { };
	let _getTimeStub;
	let _findAllStandupsStub;
	let _botId = '';

	this.Given(/it (.*) before the standup report has run for the day/, (onTime) => {
		if (onTime === 'is') {
			now = '5:30 am EST';
		}
		else {
			now = '5:30 pm EST';
		}
		_getTimeStub = sinon.stub(helpers.time, 'getDisplayFormat')
			.onFirstCall().returns(now)
			.onSecondCall().returns('12:30 pm EST');
	});

	this.Given(/^the bot ID is 'U(\d+)'$/, (botId) => {
		_botId = botId;
	});

	this.When('I add an emoji reaction to the bot\'s reminder message', (done) => {
		botLib.startDmEmoji(common.botController, 'U'+_botId);

		_message.type = 'reaction_added';
		_message.item.channel = _message.channel || 'CSomethingSaySomething';
		_message.item_user = 'U'+_botId;
		_message.user = 'U7654321';
		_message.reaction = 'thumbsup';

		_findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([ ]);
		common.botReceivesMessage(_message, common.botController.on);
		setTimeout(() => done(), 1000);
	});

	this.After(() => {
		if (_findAllStandupsStub) {
			_findAllStandupsStub.restore();
			_findAllStandupsStub = null;
		}
		if (_getTimeStub) {
			_getTimeStub.stub.restore();
			_getTimeStub = null;
		}
	});
};
