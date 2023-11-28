#!/bin/sh

# I tried pulling in a Node 'userscript' builder, but it generates a lot of nonsense.
# Let's just stuff all the modules together into a file and call it a day for now.

cp src/script-header.js ./script.js

for MODULE in modules/*.js; do
  cat $MODULE >> ./script.js
  echo >> ./script.js
done

cat src/script-loader.js >> ./script.js
