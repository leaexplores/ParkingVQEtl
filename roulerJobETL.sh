
# Création de la database couch et des views
curl -X PUT http://localhost:5984/parking_api
# Creer les views couchdb
curl -X PUT http://localhost:5984/parking_api/_design/nodejs -d @couchdb_stuff/design_views.json


# créer les folder
mkdir out
mkdir out/data

# Caller le job pour ajouter un type de source.
node ajouterTypeADocumentFeatures.js data/PANNEAU_S.GEOJSON PANNEAU_S

# Chargement de chacune des features.
node loadDocumentFeaturesAsPoints.js out/data/PANNEAU_S.GEOJSON