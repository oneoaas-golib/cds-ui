/*global module, require*/
module.exports = function(grunt) {
    'use strict';

    grunt.registerMultiTask('ovhTranslation', 'Transform XML to JSON', function() {

        var self = this;
        var Xml2json = require('../lib/ovh-translation.js');
        var path = require('path');
        var translationParser = new Xml2json({
            gruntInstance:grunt,
            keepEntities: true
        });

        /**
         * Extend destFilename json with the content of srcFilename json
         * @param destFilename
         * @param srcFilename
         * @return {boolean} true if changes on destination
         */
        var extendJson = function(destFilename, srcFilename) {
            var changes = false;
            var dest = grunt.file.readJSON(destFilename);
            var src = grunt.file.readJSON(srcFilename);
            for (var key in src) {
                if ((src.hasOwnProperty(key)) && (!dest.hasOwnProperty(key))) {
                    dest[key] = src[key];
                    changes = true;
                }
            }
            if (changes) {
                grunt.log.ok('Extending translation ' + destFilename + ' with ' + path.basename(srcFilename));
                grunt.file.write(destFilename, JSON.stringify(dest));
            }
            return changes;
        };

        /**
         * Generate JSON translation files from XML
         */
        var task_generateTranslation = function() {
            grunt.log.subhead('Writing translations => ' + self.target);
            self.files.forEach(function (d) {

                var jsonFile = translationParser.changeExtension(d.dest, 'json');
                var xmlFiles = d.src;

                grunt.log.ok('Writing translation ' + jsonFile);

                var str = '';
                for (var i=0; i<xmlFiles.length; i++) {
                    str += translationParser.xmlFileToJson(xmlFiles[i]);
                }

                grunt.file.write(jsonFile, str);
            });
        };

        /**
         * Extend the translations
         * field extendFrom must by an array of languages (ie. ['en_GB', 'fr_FR'])
         */
        var task_extendTranslation = function() {
            grunt.log.subhead('Extending translations => ' + self.target);
            self.files.forEach(function (d) {
                var jsonFile = translationParser.changeExtension(d.dest, 'json');
                if (d.extendFrom) {
                    d.extendFrom.forEach(function(lang) {
                        var sourceFile= jsonFile.replace(/_[a-z]{2}_[A-Z]{2}/, '_' + lang);
                        if (grunt.file.exists(sourceFile)) {
                            extendJson(jsonFile, sourceFile);
                        } else {
                            grunt.log.error(lang + ' could not be found in ' + sourceFile);
                        }
                    });
                }
            });
        };

        /******************************************************/
        /**  Performing actions on files                      */
        /******************************************************/

        // translate xml to json
        task_generateTranslation();


        // extending translations
        task_extendTranslation();


    });
};
