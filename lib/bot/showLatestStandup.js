'use strict';

var models = require('../../models');
const log = require('../../getLogger')('show latest standup');

function ShowLatestStandup(bot, message) {
  bot.startTyping(message);
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    if (channel.latestReport) {
      bot.api.callAPI('chat.getPermalink', {
        channel: message.channel,
        message_ts: channel.latestReport
      }, (err,permalink) => {
        if(err || !permalink.ok) {
          bot.reply(message, `Error looking up latest standup report: ${err}`);
        }
        else {
          message.unfurl_links=false; //don't automatically show the standup in the main channel
          bot.reply(message, `Most recent standup: ${permalink.permalink}`);
        }
      });

    } else {
      bot.reply(message, `No standups have been run in ${message.channel} yet`);
    }
  });
}

function attachListener(controller) {
  controller.hears(['^(where|show|latest)'],['direct_mention'], ShowLatestStandup);
  log.verbose('Attached');
}

module.exports = attachListener;
