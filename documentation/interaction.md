# Interacting with the bot

 Many non-administrative interactions with the bot can be triggered by sending a direct message (DM) to the bot or by mentioning the bot by name, or via the `/{{slash_command}}` slash command.  Sometimes, mentioning the bot in a channel or using a slash command from within a channel is a shortcut since you don't have to tell the bot what channel you're talking about.

## Standup info

To find out when the standup is scheduled for a channel, from that channel, say:

`@{{bot_name}} when`

The bot will let you know if there's not a standup scheduled yet.

## Submit your standup

There are two ways to submit your standup to the bot.  The preferred way is via the interview process.  There are a couple of ways to trigger the interview.  You can add an emoji response to one of the bot's messages (for example, its reminder message), or you can say `@{{bot_name}} interview` in the channel, or do `/{{slash_command}} interview` in the channel.

During the interview, the bot will ask you a series of questions.  If you want to skip a question, just respond to it with `skip`.  You can also abandon your standup at any time by responding with `exit`.

The other way to submit your standup is with block text.  You can submit your entire standup in a single message by sending a DM to the bot of the form:

```
standup #channel
Y: yesterday's info
T: today's info
B: blockers
```

All of the sections (Y/T/B) are optional, but the channel name is required.

Once the bot has accepted your standup, it will display the standup back to you if it has not yet reported for that channel (if it has already reported, it will let you know that it is updating the report).

## Editing your standup

There are a few ways to edit your standup after you've submitted it.  You can run the interview again by adding another emoji reaction to the bot's message or saying `@{{bot_name}} interview` or `/{{slash_command}} interview` again (if you're happy with certain sections, you can `skip` them to keep them the same).

You can also ask the bot to let you edit one section.  In a DM say, `standup #channel edit <section>`, e.g. `standup #myroom edit blockers` or `standup #myroom edit today` and the bot will start an interview, showing you your previous response for that interview question and asking you for a new one.

If you sent your standup as block text, you can edit that message to edit your standup.

Finally, you can send the bot another block text DM.  Any sections you supply in the new standup block text will overwrite the previous standup.

## Setting yourself out-of-office

If you know you'll be out of the office for a few days and would like the bot to automatically post standups on your behalf while you're away, you can tell it you'll be gone.  To do that, you can either tell the bot in the channel that you want to automatically report in:

```
@{{bot_name}} I'll be out of the office for 3 days
```

Or you can send the bot a DM and tell it which channel to automatically report in:

```
#channel out of the office for 3 days
```

The bot understands other variations of these messages.  Here are some examples:

```
@{{bot_name}} out of office 3 days
@{{bot_name}} out of office 3
@{{bot_name}} ooo 3
```

Slash commands also work, e.g.
```
/{{slash_command}} ooo 3
```

## Finding the most recent standup thread
To get a permalink to the most recent standup report thread, ask `@{{bot_name}} latest` or `/{{slash_command}} latest` in a channel.  Alternate watch words to `latest` are `where` and `show`, e.g. `/{{slash_command}} show me the most recent standup`.

## Get help

The bot can provide a quick reference to using it.  To trigger the bot's in-Slack help, just say `help` in a DM or `@{{bot_name}} help` or `/{{slash_command}} help` in any channel the bot is in.
