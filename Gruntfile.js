module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            options: {
                configFile: 'eslint.json'
            },
            files: [
                'Gruntfile.js',
                'config.js',
                'request_validation.js',
                'collect_urls_site.js',
                'validator.js',
                'index.js'
            ]
        }
    });

    // Load dependencies.
    grunt.loadNpmTasks('grunt-eslint');

    // Default task(s).
    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('default', ['eslint']);
};
