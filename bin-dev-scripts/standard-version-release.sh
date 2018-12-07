#!/usr/bin/env bash

npm install
npm test
git diff --quiet

BRANCH=git branch | grep \* | cut -d ' ' -f2-

if [ $BRANCH == 'master' ]
then
  npx standard-version
else
  npx standard-version --prerelease $(git branch | grep \* | cut -d ' ' -f2-)
fi

unset BRANCH
git push --follow-tags origin
