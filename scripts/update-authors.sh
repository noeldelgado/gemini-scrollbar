#!/bin/sh
# borrowed from: https://github.com/npm/npm/blob/master/scripts/update-authors.sh

git log --reverse --format='%aN <%aE>' | perl -wnE '
BEGIN {
  say "# Authors ordered by first contribution.\n";
}
print $seen{$_} = $_ unless $seen{$_}
' > AUTHORS
