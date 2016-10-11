/*global angular */

/**
 * @ngdoc service
 * @name cdsApp.cdsApiProvider
 * @module cdsApp
 * @description
 *
 * Manager CDS Api URI
 *
 */
angular.module("cdsApp")
    .provider("cdsApiProvider", function (CONFIG) {
        "use strict";

        this.$get = function () {

            /**
             * @ngdoc service
             * @name cdsApp.CDSApi
             * @module cdsApp
             * @description
             *
             * Manager CDSApi URI.
             */
            return {
                /**
                 * @ngdoc function
                 * @name buildUrl
                 * @methodOf cdsApp.cdsApiProvider
                 * @module cdsApp
                 * @description
                 *
                 * Build the URL to CDS Api
                 *
                 * @param {string} path Relative path to CDS Api
                 */
                buildUrl: function (path) {
                    return CONFIG.apiRouteBase + path;
                }
            };
        };
    });
