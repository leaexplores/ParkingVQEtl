#This file is part of ParkingVQETL.
#
#ParkingVQETL is free software: you can redistribute it and/or modify
#it under the terms of the GNU General Public License as published by
#the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.
#
#ParkingVQETL is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU General Public License for more details.
#
#You should have received a copy of the GNU General Public License
#along with ParkingVQETL.  If not, see <http://www.gnu.org/licenses/>.

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
