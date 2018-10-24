#!/usr/bin/env node
'use strict';

const fs = require('fs');

const config = require('./config');
const request_validation = require('./request_validation');
const collect_urls_site = require('./collect_urls_site');
const validate_pages = require('./validate_pages');
const submit_validation = require('./submit_validation');


request_validation.run(
    config.default_request_validation_file
).then(function() {
    var data = fs.readFileSync(config.default_request_validation_file, 'utf8');
    var site = JSON.parse(data);

    collect_urls_site.run(
        site['site'],
        config.default_pages_file
    ).then(function() {
        validate_pages.run(
            config.default_pages_file,
            config.default_validation_file
        ).then(function() {
            submit_validation.run(
                config.default_validation_file,
                config.default_request_validation_file,
                config.default_pages_file
            );
        });
    })
});
