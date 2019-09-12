Feature: Send standup to the bot

  Scenario: I try to edit a standup for a public channel
    Given the bot is running
    And the public channel does have a standup
    And I have previous standup reports for public channel
    When I DM the bot with standup #public edit
    Then the bot should start a private message with ":thumbsup: You bet!"

	Scenario Outline: I try to edit a standup without an existing standup for a public channel
    Given the bot is running
    And the <visibility> channel does have a standup
		And the bot knows the mention for the <visibility> channel
    And I do not have previous standup reports for <visibility> channel
    When I DM the bot with standup #<visibility> edit
    Then the bot should start a private message with ":thinking_face: It seems"

		Examples:
		| visibility |
		| public     |
		| private    |

  Scenario Outline: I try to edit a standup in an invalid manner
    Given the bot is running
    And the <visibility> channel <status> have a standup
		And the bot knows the mention for the <visibility> channel
    And I have previous standup reports for <visibility> channel
    When I DM the bot with standup #<visibility> edit
    Then the bot should respond "<response>"

    Examples:
      | visibility | status   | response |
      | public     | does not | channel doesn't have any standups set |
      | private    | does not | channel doesn't have any standups set |
