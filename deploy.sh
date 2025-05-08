#!/bin/bash

echo "===> Nettoyage des anciens fichiers"
rm -rf dist .output

echo "===> Génération du site statique Nuxt"
npm run generate

echo "===> Ajout du fichier .nojekyll"
touch dist/.nojekyll

echo "===> Déploiement sur la branche gh-pages"
cd dist
git init
git checkout -b gh-pages
git remote add origin https://github.com/imbodj/SenCoursDeMaths.git
git add .
git commit -m "Déploiement automatique avec .nojekyll"
git push --force origin gh-pages
cd ..

echo "===> Déploiement terminé. Vérifie le site : https://imbodj.github.io/SenCoursDeMaths/"
