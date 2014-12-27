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
// Ce script charge à l'intérieur de couchDB un documentFeatures en tant que liste de points !
// 1er paramètre nom du fichier à charger

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var JSONStream = require('JSONStream');

var nano = require('nano')('http://localhost:5984');
var db_name = "parking_api";
var db = nano.use(db_name);

// Nom du fichier à traiter!
var filename = process.argv[2];

function insert_doc(doc, tried) {
    db.insert(doc,
      function (error,http_body,http_headers) {
        if(error) {
          if(error.message === 'no_db_file'  && tried < 1) {
            // create database and retry
            return nano.db.create(db_name, function () {
              insert_doc(doc, tried+1);
            });
          }
          else { return console.log(error); }
        }
      //  console.log(http_body);
    });
  }

function streamJsonToCouch(pFilename){
  var stream = fs.createReadStream(pFilename, {encoding: 'utf8'}),
    parser = JSONStream.parse('features.*');

stream.pipe(parser);

parser.on('data', function(data) {
  insert_doc(data,0);
});
}

console.log('starting load for '+ filename);
streamJsonToCouch(filename);
console.log('end loading ' + filename);
