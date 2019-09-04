'use strict';

var models = require('../../models');
var timeHelper = require('../helpers').time;

function GetStandupInfo(bot, message) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    if (channel) {
      let responseText = `There's a standup scheduled for ${timeHelper.getDisplayFormat(channel.time)} on ${timeHelper.getDisplayFormatForDaysOfChannel(channel)}.`;
      if(channel.reminderMinutes) {
        let reminderSuffix = channel.audience ? ` that mentions ${channel.audience}.` : '.';
        responseText += `  A reminder will be sent out ${channel.reminderMinutes} minutes before${reminderSuffix}`;
      }
      bot.reply(message, responseText);
    } else {
      bot.reply(message, 'There\'s no standup scheduled yet.');
    }
  });
}

function attachListener(controller) {
  controller.hears(['^when'],['direct_mention'], GetStandupInfo);
}

module.exports = attachListener;
