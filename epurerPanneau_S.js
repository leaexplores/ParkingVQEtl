// Ce script ajoute une propriété type a chacun des features d'un documentFeatures

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var JSONStream = require('JSONStream');

// Nom du fichier à traiter!
var filename = process.argv[2];
var diroutput = process.argv[3];
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

    parser.on('data', function (data) {
        // Si c'est un arret RTC on s'en criss....
        if (data.properties.TYPE_DESC !== undefined && data.properties.TYPE_DESC.indexOf("RTC") > -1) {
            console.log('hit rtc data skipping it');
        } else {
            if (data.properties.TYPE_DESC !== undefined && (data.properties.TYPE_DESC.indexOf("MIN") > -1 || data.properties.TYPE_DESC.indexOf("min") > -1 || data.properties.TYPE_DESC.indexOf("H") > -1 || data.properties.TYPE_DESC.indexOf("h") > -1)) {
                console.log('hit stationnement zone limite');
                data.properties.STATIONEMENT_LIMITE = true;
                realGeoJsonDoc.features.push(data);
            } else {
                realGeoJsonDoc.features.push(data);
            }
        }
    });


    parser.on('close', function () {
        console.log('finished parsing the json now writing it :)');
        fs.writeFile(diroutput, JSON.stringify(realGeoJsonDoc), function (err) {
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
