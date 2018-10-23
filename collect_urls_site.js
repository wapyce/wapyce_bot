#!/usr/bin/env node
'use strict';

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const url = require('url');

const config = require('./config');


var started = 0;
var finished = 0;

function visitAllPages(baseURL, outputFile) {
    return new Promise(function(resolve) {
        function visitPage(currentURL, allURLs) {
            if (
                (allURLs.indexOf(currentURL) === -1)
                && (allURLs.indexOf(currentURL + '/') === -1)
                && (
                    !currentURL.endsWith('/')
                    || (
                        currentURL.endsWith('/')
                        && (
                            allURLs.indexOf(
                                currentURL.substring(0, currentURL.length - 1)
                            ) === -1
                        )
                    )
                )
            ) {
                started++;

                allURLs.push(currentURL);
                var currentURLs = [];
                request(currentURL, function(error, response, body) {
                    if ((!error) && (body.indexOf('<html') > -1)) {
                        var $ = cheerio.load(body);
                        var links = $('a[href]');
                        links.each(function(index, link) {
                            var linkURL = url.resolve(
                                currentURL,
                                $(link).attr('href')
                            );
                            if (linkURL.indexOf('#') > -1) {
                                linkURL = linkURL.substring(
                                    0,
                                    linkURL.indexOf('#')
                                );
                            }
                            if (linkURL.indexOf(baseURL) === 0) {
                                currentURLs.push(linkURL);
                            }
                        });
                        currentURLs.forEach(function(linkURL) {
                            visitPage(linkURL, allURLs);
                        });
                    } else if (body.indexOf('<html') > -1) {
                        console.error(error);
                    }

                    finished++;
                    if (started == finished) {
                        fs.writeFileSync(
                            outputFile,
                            JSON.stringify(allURLs),
                            'utf8'
                        );

                        console.log(
                            'All urls of "' +
                             baseURL +
                             '" saved on "' +
                             outputFile +
                             '".'
                        );
                        resolve(null);
                    }
                });
            }
        }

        visitPage(baseURL, []);
    });
}

async function run(baseURL, outputFile) {
    await visitAllPages(baseURL, outputFile);
}

if (require.main === module) {
    var argv = require('yargs')
        .usage('Usage: $0 https://www.example.com/')
        .demandCommand(1)
        .alias('o', 'output-file')
        .default('o', config.default_pages_file)
        .argv;
    var baseURL = argv._[0];
    var outputFile = argv.o;

    run(baseURL, outputFile);
}

module.exports = {run: run};
