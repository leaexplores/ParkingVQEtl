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


function extractNbMinAutoriseFromProps(doc) {
    var regex = /[1-9].*min+/g;
    if (doc.properties.TYPE_DESC !== undefined && doc.properties.TYPE_DESC.indexOf("min") > -1) {
        var outId = regex.exec(doc.properties.TYPE_DESC);
        if (outId !== null && outId !== undefined && outId.indexOf("-") === -1) {
            return outId[0];
        }
    } else {
        return undefined;
    }
}

function extraiteHeuresDebutEtFin(doc) {
    var runRegex, regex, firstSplit, splitRegex, iCpt, heuresAutorise;
    // Regex pour extraire les heures !!
    var regex = /([0-9]+h).(-*).*[0-9]([0-9])?h([0-9])?([0-9])?/
    if (doc.properties.TYPE_DESC !== undefined && (doc.properties.TYPE_DESC.indexOf("H") > -1 || doc.properties.TYPE_DESC.indexOf("h") > -1)) {
        var runRegex = regex.exec(doc.properties.TYPE_DESC);
        if (runRegex !== undefined && runRegex !== null) {
            splitRegex = [];
            firstSplit = runRegex[0].split("-");
            for (iCpt = 0; iCpt < firstSplit.length; iCpt = iCpt + 1) {
                var tempSplit = firstSplit[iCpt].split(",");
                for (var jCpt = 0; jCpt < tempSplit.length; jCpt++) {
                       splitRegex.push(tempSplit[jCpt]);
                }
            }
            // Trim the dataset...
            for (iCpt = 0; iCpt < splitRegex.length; iCpt = iCpt + 1) {
                splitRegex[iCpt] = splitRegex[iCpt].trim();
            }
            heuresAutorise = [];
            if (splitRegex.length % 2 === 0) {
            for (iCpt = 0; iCpt < splitRegex.length; iCpt = iCpt + 2) {
                heuresAutorise[iCpt] = []
                // Heure de debut
                if (splitRegex[iCpt].indexOf("h") > -1 || splitRegex[iCpt].indexOf("H") > -1)
                    heuresAutorise[iCpt][0] = splitRegex[iCpt].substr(0, splitRegex[iCpt].toUpperCase().indexOf("H"));
                else
                    heuresAutorise[iCpt][0] = splitRegex[iCpt];
                // Heure de fin
                if (splitRegex[iCpt + 1].indexOf("h") > -1 || splitRegex[iCpt + 1].indexOf("H") > -1)
                    heuresAutorise[iCpt][1] = splitRegex[iCpt + 1].substr(0, splitRegex[iCpt + 1].toUpperCase().indexOf("H"));
                else
                    heuresAutorise[iCpt][1] = splitRegex[iCpt + 1];
            } }
            else {
                console.log('Warning heures de parking en.. '+ splitRegex.length + ' - ' + splitRegex);
            }

            return heuresAutorise;
        }
    }

    return undefined;
}

function streamJsonToCouch(pFilename) {
    var stream = fs.createReadStream(pFilename, {
            encoding: 'utf8'
        }),
        parser = JSONStream.parse('features.*');

    stream.pipe(parser);

    parser.on('data', function (data) {
        // Si c'est un arret RTC on s'en criss....
        if (data.properties.TYPE_DESC !== undefined && data.properties.TYPE_DESC.indexOf("RTC") > -1) {
            ///console.log('hit rtc data skipping it');
        } else {
            if (data.properties.TYPE_DESC !== undefined && (data.properties.TYPE_DESC.indexOf("MIN") > -1 || data.properties.TYPE_DESC.indexOf("min") > -1 || data.properties.TYPE_DESC.indexOf("H") > -1 || data.properties.TYPE_DESC.indexOf("h") > -1)) {
                //  console.log('hit stationnement zone limite');
                // Creation de props :)
                data.properties.STATIONEMENT_LIMITE = true;
                data.properties.NB_MINUTES_AUTORISE = extractNbMinAutoriseFromProps(data);
                data.properties.HEURES_AUTORISE = extraiteHeuresDebutEtFin(data);

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
