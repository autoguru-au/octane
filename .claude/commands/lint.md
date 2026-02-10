# Runs code linting. Use `/lint fix` or `/lint -f` to attempt fixing linting errors.
Run this command from the monorepo root folder
bun run format && bun run lint
If $ARGUMENTS has `-f` or case insensitive `fix` you should fix linting errors if any from the previous command
