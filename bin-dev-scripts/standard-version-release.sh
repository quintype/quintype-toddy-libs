#!/bin/bash -e

npm install
git diff --quiet

BRANCH=$(git symbolic-ref --short HEAD)

if [ "$BRANCH" == 'master' ]
then
  npx standard-version
else
  npx standard-version --prerelease "$BRANCH" --skip.changelog=true
fi

git push --follow-tags origin "$BRANCH"
