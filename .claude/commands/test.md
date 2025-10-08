# Runs all tests. Use `/test fix` or `/test -f` to attempt fixing fialing tests.
Run this command from the monorepo root folder
yarn relay && yarn test
If $ARGUMENTS has `-f` or case insensitive `fix` you should attempt to fix breaking tests.