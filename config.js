const path = require('path');

var config = {};

config.directory_validations = path.join(process.cwd(), 'validations');

config.default_request_validation_file = path.join(process.cwd(), 'site.json');

config.user_token = '7b0e1a3ac8155bec2e23a33855d585d3b8c4542d';
config.wapyce_url_address = 'http://localhost:8000/';

module.exports = config;
