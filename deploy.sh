#!/bin/sh
git checkout master && \
(git branch -D dist || true) && \
git checkout -b dist && \
rm .gitignore && \
npm run prod && \
cp dist/atlas-medliq/index.html dist/atlas-medliq/404.html && \
(cp CNAME dist/atlas-medliq/ || true) && \
git add dist/atlas-medliq && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/atlas-medliq -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout master && \
git branch -D gh-pages && \
git branch -D dist && \
git checkout . && \
git push
