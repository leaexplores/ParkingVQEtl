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
