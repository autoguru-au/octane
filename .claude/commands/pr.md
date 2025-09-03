# Creates a new draft Pull Request or updates the PR body for an existing one with latest changes. Use `/pr AG-12345` to tag the Pull request with ticket name otherwise you will be asked to provide one.

Check if the current branch has an existing PR. 
If a PR exists then update the title and body based on the latest changes in the branch following the title and body requirements below and show the user a link to the PR.
If no PR exists then create a new draft Pull Request.

PR title and body must always use Australian/UK spellings.
PR title should follow the Semantic Commit Messages standard defined below.
PR body should start with the value for $ARGUMENTS in a separate line. If $ARGUMENTS is empty you should provide the user with a prompt to optionally provide the value with this message: `What is your JIRA ticket number for this PR?` and use the user response for the $ARGUMENTS. If the user did not provide a value for the JIRA ticket number then do not include the $ARGUMENTS line in the PR body.
PR body should include meaningful and helpful commit summaries when applicable to the changes in the branch and where appropriate include tables and mermaid chart format charts.


## Semantic Commit Messages:

Format: <type>(<scope>): <subject>

<scope> is optional

Example
feat: add centralised logging provider
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
More Examples:

feat: (new feature for the user, not a new feature for build script)
fix: (bug fix for the user, not a fix to a build script)
docs: (changes to the documentation)
style: (formatting, missing semi colons, etc; no production code change)
refactor: (refactoring production code, eg. renaming a variable)
test: (adding missing tests, refactoring tests; no production code change)
chore: (updating grunt tasks etc; no production code change)