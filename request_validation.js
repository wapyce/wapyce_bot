#!/usr/bin/env node
'use strict';

const fs = require('fs');

const request = require('request');

const config = require('./config');

const REQUEST_VALIDATION_PATH = 'api/v1/validation/validations/'


var argv = require('yargs')
    .usage('Usage: $0 -o site.json')
    .alias('o', 'output-file')
    .default('o', config.default_request_validation_file)
    .argv;
var outputFile = argv.o;

var options = {
    method: 'POST',
    url: config.wapyce_url_address + REQUEST_VALIDATION_PATH,
    headers: {'Authorization': 'Token ' + config.user_token}
};

request(options, function(error, response, body) {
    if (error) {
        throw error;
    }

    if (response.statusCode == 201) {
        fs.writeFileSync(outputFile, body, 'utf8');

        console.log('The webservice returned the site.');
    } else {
        throw new Error('Not allowed to validate a new site.');
    }
});
