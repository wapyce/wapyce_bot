const path = require('path');

var config = {};

config.directory_validations = path.join(process.cwd(), 'validations');

config.default_request_validation_file = path.join(process.cwd(), 'site.json');
config.default_pages_file = path.join(process.cwd(), 'pages.json');

config.user_token = 'YOUR_USER_TOKEN';
config.wapyce_url_address = 'https://wapyce.herokuapp.com/';

module.exports = config;
