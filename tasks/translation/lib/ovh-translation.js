/*global module, require*/
(function(){
    'use strict';

    var xmlParser = require('node-xml-lite');

    /**
     * Constructor
     * @param {{gruntInstance, keepEntities}} options
     * @constructor
     */
    var OvhTranslation = function(options) {
        this.gruntInstance = options.gruntInstance;
        this.keepEntities = 'undefined' === typeof options.keepEntities ? true: options.keepEntities;
    };

    /**
     * Convert a parsed Xml object in a string
     * @param {object} parsedData Data parsed from node-xml-lite
     * @returns {string} string representation of the xml
     */
    OvhTranslation.prototype.parsedDataToString = function(parsedData) {
        var str='';
        for (var i=0; i<parsedData.length; i++) {
            if (parsedData[i].name) {
                // get attributes
                var attrs = [];
                for (var key in parsedData[i].attrib) {
                    if (parsedData[i].attrib.hasOwnProperty(key)) {
                        attrs.push(key + '="' + parsedData[i].attrib[key] + '"');
                    }
                }
                // get child nodes
                if (parsedData[i].childs) {
                    str += '<' + parsedData[i].name + ' ' + attrs.join(' ') + '>' + this.parsedDataToString(parsedData[i].childs) + '</' + parsedData[i].name + '>';
                } else {
                    str += '<' + parsedData[i].name + ' ' + attrs.join(' ') + '/>';
                }
            } else {
                // the node was a string
                str += parsedData[i];
            }
        }
        return str;
    };

    /**
     * Convert xml representation of translations into a javascript object
     * @param {string} xmlData String containing the xml
     * @returns {{}} key-value translations
     */
    OvhTranslation.prototype.toObject = function(xmlData) {
        var obj = {};
        try {
            var parsedData = xmlParser.parseString(this.keepEntities ? xmlData.replace(/&/g, '&amp;') : xmlData);
            // first node must by 'translations'
            if ((parsedData) && (parsedData.name === 'translations')) {
                for (var i=0; i<parsedData.childs.length; i++) {
                    var entry = parsedData.childs[i];
                    // the child nodes must be 'translation' and must have an attribute 'id'
                    if ((entry.name === 'translation') && (entry.attrib) && (entry.attrib.id) && (entry.childs)) {
                        obj[entry.attrib.id] = this.parsedDataToString(entry.childs);
                    }
                }
            }
        } catch (e) {
            this.gruntInstance.log.error(e);
            throw e;
        }
        return obj;
    };

    /**
     * Convert a XML file to JSON
     * @param {string} filePath Path of the XML file
     * @return {string} JSON
     */
    OvhTranslation.prototype.xmlFileToJson = function(filePath) {
        var data = this.gruntInstance.file.read(filePath);
        var obj = this.toObject(data);
        return JSON.stringify(obj);
    };

    /**
     * Replace the extension of a file with a custom one
     * @param {string} Filename Concerned filename
     * @param {string} extension New extention without the leading dot
     * @returns {string}
     */
    OvhTranslation.prototype.changeExtension = function(Filename, extension) {
        return Filename.replace(/\.xml$/, '.' + extension);
    };

    module.exports = OvhTranslation;

})();
