Feature: Get usage help

  Scenario: I ask for help in a channel
    Given the bot is running
    And I am in a room with the bot
    When I say "@bot help"
    Then the bot should privately respond "Check out my"

	Scenario: I ask for help in a channel with a slash command
    Given the bot is running
    And I am in a room with the bot
    When I slash command "help"
    Then the webhook bot should privately respond "Check out my"

  Scenario: I ask for help in a DM
    Given the bot is running
    And I am in a room with the bot
    When I DM the bot with "help"
    Then the bot should privately respond "Check out my"
