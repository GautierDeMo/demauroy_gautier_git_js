#!/bin/sh
#
# An example hook script to check the commit log message.
# Called by "git commit" with one argument, the name of the file
# that has the commit message.  The hook should exit with non-zero
# status after issuing an appropriate message if it wants to stop the
# commit.  The hook is allowed to edit the commit message file.
#
# To enable this hook, rename this file to "commit-msg".

# Uncomment the below to add a Signed-off-by line to the message.
# Doing this in a hook is a bad idea in general, but the prepare-commit-msg
# hook is more suited to it.
#
# SOB=$(git var GIT_AUTHOR_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# grep -qs "^$SOB" "$1" || echo "$SOB" >> "$1"

# This test example catches duplicate Signed-off-by lines.

# test "" = "$(grep '^Signed-off-by: ' "$1" |
# 	 sort | uniq -c | sed -e '/^[ 	]*1[ 	]/d')" || {
# 	echo >&2 Duplicate Signed-off-by lines.
# 	exit 1
# }
commit_title=$(head -n1 "$1")

conventional_commit_title_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert|hotfix)(\(.+\))?(!)?:( )?.{1,72}$'

if ! echo "$commit_title" | grep -qE "$conventional_commit_title_regex" ; then
    echo "Invalid commit message format!"
    echo "Format: <type>(<scope>): <subject>"
    echo "Example: feat(auth): add login functionality"
    echo ""
    echo "Types: feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert|hotfix"
    exit 1
fi

line_count=$(wc -l < "$1")

if [ "$line_count" -gt 1 ]; then
	second_line=$(sed -n '2p' "$1")
	if [ -n "$second_line" ]; then
		echo "Error, the second line of your commit needs to be a blank line."
		exit 1
	fi
fi

exit 0
