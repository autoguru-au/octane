# Commit staged changes. Use `/commit all` or `/commit -a` to stage all changes first and commit 
Commit staged changes if $ARGUMENTS is empty or is not `all` case insensitive or `-a` or there are no staged changes in which case you should stage all the changes to commit.
Commit messages should never reference claude code in message or as co-author.
Commit messages should include meaningful and helpful commit summaries when applicable to the changes being commited.
Commit messages must always use Australian/UK spellings.
Commit message should follow Semantic Commit Messages standard defined bellow

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