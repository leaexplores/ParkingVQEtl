/*
This file is part of ParkingVQETL.

ParkingVQETL is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ParkingVQETL is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ParkingVQETL.  If not, see <http://www.gnu.org/licenses/>.
*/

// Ce script ajoute une propriété type a chacun des features d'un documentFeatures

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var JSONStream = require('JSONStream');

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
