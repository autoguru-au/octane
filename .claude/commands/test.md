# Runs all tests. Use `/test fix` or `/test -f` to attempt fixing failing tests.
Run this command from the monorepo root folder
bun run relay && bun run test
If $ARGUMENTS has `-f` or case insensitive `fix` you should attempt to fix breaking tests.
