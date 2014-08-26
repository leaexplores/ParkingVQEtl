// Ce script ajoute une propriété type a chacun des features d'un documentFeatures

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var JSONStream = require('JSONStream');

var nano = require('nano')('http://localhost:5984');
var db_name = "geojson_api";
var db = nano.use(db_name);

// Nom du fichier à traiter!
var filename = process.argv[2];
var typeAdd = process.argv[3];

var realGeoJsonDoc = {
  "name": "PARKING_POIS",
  "type": "FeatureCollection",
  "features": []
};

function streamJsonToCouch(pFilename) {
  var stream = fs.createReadStream(pFilename, {
    encoding: 'utf8'
  }),
    parser = JSONStream.parse('features.*');

  stream.pipe(parser);

  parser.on('data', function(data) {
    data.properties.TYPE_SRC = typeAdd;
    realGeoJsonDoc.features.push(data);
  });


  parser.on('close', function() {
    console.log('finished parsing the json now writing it :)');
    fs.writeFile("out/" + filename, JSON.stringify(realGeoJsonDoc), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("The file was saved!");
      }
    });


  })
}

console.log('starting load for ' + filename);
streamJsonToCouch(filename);
