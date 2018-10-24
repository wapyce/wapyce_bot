#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const request = require('request');

const config = require('./config');

const SUBMIT_PAGES_PATH = (
    config.wapyce_url_address
    + 'api/v1/validation/pages/'
);
const SUBMIT_ISSUES_PATH = (
    config.wapyce_url_address
    + 'api/v1/accessibility/issues/'
);
const FINISH_VALIDATION_PATH = (
    config.wapyce_url_address +
    'api/v1/validation/validations/%s/finish_validation/'
);
const HEADERS = {
    'Authorization': 'Token ' + config.user_token,
    'Content-Type': 'application/json'
}


function run(validationFile, requestValidationFile, pagesFile) {
    var validationContent = fs.readFileSync(validationFile, 'utf8');
    var completeValidations = JSON.parse(validationContent);
    var completeIssues = [];

    var wapyceValidation = JSON.parse(
        fs.readFileSync(requestValidationFile, 'utf8')
    );
    var wapyceValidationUUID = wapyceValidation['uuid'];

    for (var i = 0, length = completeValidations.length; i < length; i++) {
        completeIssues = completeIssues.concat(
            completeValidations[i]['issues']
        );
    }

    return new Promise(function(resolve) {
        function finishValidation() {
            var options = {
                method: 'PUT',
                url: FINISH_VALIDATION_PATH.replace(
                    '%s',
                    wapyceValidationUUID
                ),
                headers: HEADERS
            };
            request(options, function(error, response, body) {
                if (error) {
                    throw error;
                }

                if (response.statusCode === 200) {
                    var validationDirectory = path.join(
                        config.directory_validations,
                        wapyceValidationUUID
                    );

                    if (!fs.existsSync(config.directory_validations)) {
                        fs.mkdirSync(config.directory_validations);
                    }
                    if (!fs.existsSync(validationDirectory)) {
                        fs.mkdirSync(validationDirectory);
                    }

                    fs.renameSync(
                        requestValidationFile,
                        path.join(
                            validationDirectory,
                            path.basename(
                                config.default_request_validation_file
                            )
                        )
                    );
                    fs.renameSync(
                        pagesFile,
                        path.join(
                            validationDirectory,
                            path.basename(config.default_pages_file)
                        )
                    );
                    fs.renameSync(
                        validationFile,
                        path.join(
                            validationDirectory,
                            path.basename(config.default_validation_file)
                        )
                    );

                    console.log('Validation finished.');
                    resolve(null);
                } else {
                    throw new Error('Validation not finished.');
                }
            });
        }

        function submitIssues(issues) {
            if (issues.length === 0) {
                finishValidation();
                return ;
            }

            var issue = issues.shift();
            if (!issue.hasOwnProperty('uuid')) {
                var options = {
                    method: 'POST',
                    url: SUBMIT_ISSUES_PATH,
                    headers: HEADERS,
                    form: {
                        page: issue['page'],
                        code: issue['code'],
                        context: issue['context'],
                        message: issue['message'],
                        selector: issue['selector'],
                        issue_type: issue['typeCode']
                    }
                };
                request(options, function(error, response, body) {
                    if (error) {
                        throw error;
                    }

                    if (response.statusCode === 201) {
                        var wapyceIssue = JSON.parse(body);

                        issue['uuid'] = wapyceIssue['uuid'];

                        fs.writeFileSync(
                            validationFile,
                            JSON.stringify(completeValidations),
                            'utf8'
                        );

                        console.log('Issue of page submitted.');
                    } else {
                        throw new Error('Issue of page not submitted.');
                    }
                    submitIssues(issues);
                });
            } else {
                submitIssues(issues);
            }
        }

        function submitPages(validations, index) {
            if (validations.length === 0) {
                submitIssues(completeIssues);
                return ;
            }

            var validation = validations.shift();

            if (!validation.hasOwnProperty('uuid')) {
                var options = {
                    method: 'POST',
                    url: SUBMIT_PAGES_PATH,
                    headers: HEADERS,
                    form: {
                        validation_site: wapyceValidationUUID,
                        page_url: validation['pageUrl']
                    }
                };

                request(options, function(error, response, body) {
                    if (error) {
                        throw error;
                    }

                    if (response.statusCode === 201) {
                        var wapycePage = JSON.parse(body);

                        completeValidations[index]['uuid'] = (
                            wapycePage['uuid']
                        );
                        var issues = completeValidations[index]['issues']
                        for (
                            var i = 0, length = issues.length;
                            i < length;
                            i++
                        ) {
                            issues[i]['page'] = wapycePage['uuid'];
                        }

                        fs.writeFileSync(
                            validationFile,
                            JSON.stringify(completeValidations),
                            'utf8'
                        );

                        console.log('Validated page submitted.');
                    } else {
                        throw new Error('Validated page not submitted.');
                    }
                    submitPages(validations, index + 1);
                });
            } else {
                submitPages(validations, index + 1);
            }
        }

        submitPages(JSON.parse(validationContent), 0);
    });
}

if (require.main === module) {
    var argv = require('yargs')
        .usage('Usage: $0 -o site.json')
        .alias('i', 'validation-file')
        .default('i', config.default_validation_file)
        .alias('r', 'request-validation-file')
        .default('r', config.default_request_validation_file)
        .alias('p', 'pages-file')
        .default('p', config.default_pages_file)
        .argv;
    var validationFile = argv.i;
    var requestValidationFile = argv.r;
    var pagesFile = argv.p;

    run(validationFile, requestValidationFile, pagesFile);
}

module.exports = {run: run};
