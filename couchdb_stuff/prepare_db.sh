# Creer la BD
curl -X PUT http://localhost:5984/parking_api
# Creer les views couchdb
curl -X PUT http://localhost:5984/parking_api/_design/nodejs -d @design_views.json
