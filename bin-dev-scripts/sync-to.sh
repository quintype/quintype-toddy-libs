#!/usr/bin/env bash

PATH_TO_APP="$1"

if [ -z $PATH_TO_APP ] ; then
  echo "please provide relative path to the app; eg  ../madrid "
  exit 1
fi

rsync -r \
  client server isomorphic \
  "$PATH_TO_APP/node_modules/@quintype/framework/" \
  && touch "$PATH_TO_APP/app/isomorphic/pick-component.js"