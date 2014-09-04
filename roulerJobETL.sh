
# Création de la database couch et des views
curl -X PUT http://localhost:5984/parking_api
# Creer les views couchdb
curl -X PUT http://localhost:5984/parking_api/_design/nodejs -d @couchdb_stuff/design_views.json


# créer les folder et tenter de vider si ca existe deja....
mkdir out
mkdir out/data
rm out/data/*

# Caller le job pour ajouter un type de source.
node ajouterTypeADocumentFeatures.js data/PANNEAU_S.GEOJSON PANNEAU_S
node ajouterTypeADocumentFeatures.js data/PARCOMETRE.GEOJSON PARCOMETRE

# Conversion en geojson + Ajout type source pour bornes fontaines.
node loadCSVBornesFontainesToGeojson.js data/BORNE.csv

# Transformer PANNEAU_S sans les dumb panneau + nouvelles props :)
node epurerPanneau_S.js out/data/PANNEAU_S.GEOJSON out/data/PANNEAU_S_TRANSFO.GEOJSON


# Chargement de chacune des features.
node loadDocumentFeaturesAsPoints.js out/data/PANNEAU_S_TRANSFO.GEOJSON
node loadDocumentFeaturesAsPoints.js out/data/PARCOMETRE.GEOJSON
node loadDocumentFeaturesAsPoints.js out/data/BORNE.csv

# Démarage de la génération de la génération de la vue.
curl -X GET http://localhost:5984/parking_api/_design/nodejs/_view/keys?limit=0
