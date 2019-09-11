Feature: Bot introduces itself when it joins a channel

  Scenario Outline: Bot joins a channel
    Given the bot is running
    And the bot is named "<bot_name>"
    When the bot joins a channel
    Then the bot should respond
      """
      :wave: Hi! To set up a standup, say `@<bot_name> create standup \[time\]`
      For more information, say `@<bot_name> help`
      """

    Examples:
      | bot_name      |
      | standup-bot   |
      | optimus-prime |
