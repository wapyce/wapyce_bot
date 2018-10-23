#!/usr/bin/env node
'use strict';

const fs = require('fs');

const pa11y = require('pa11y');

const config = require('./config');


function run(jsonFile, outputFile) {
    return new Promise(function(resolve) {
        fs.readFile(inputFile, 'utf8', async function (err, data) {
            if (err) {
                throw err;
            }
            var pages = JSON.parse(data);

            const options = {reporter: 'json', standard: 'WCAG2AA'};

            var results = [];
            for (var i = 0, len = pages.length; i < len; i++) {
                var page = pages[i];

                results.push(await pa11y(page, options));
            }

            fs.writeFileSync(outputFile, JSON.stringify(results), 'utf8');

            console.log(
                'All urls of file "' +
                inputFile +
                '" are validated and results saved on "' +
                outputFile +
                '".'
            );
            resolve(null);
        });
    });
}

if (require.main === module) {
    var argv = require('yargs')
        .usage('Usage: $0 -i pages.json')
        .alias('i', 'input-file')
        .default('i', config.default_pages_file)
        .alias('o', 'output-file')
        .default('o', config.default_validation_file)
        .argv;
    var inputFile = argv.i;
    var outputFile = argv.o;

    run(jsonFile, outputFile);
}

module.exports = {run: run};
