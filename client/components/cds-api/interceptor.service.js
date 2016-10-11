/*global angular */

/**
 * @ngdoc service
 * @name cdsApp.cdsApiInterceptor
 * @module cdsApp
 * @description
 * Http interceptor to transform uri cdsapi/* to CDSApi uri
 *
 */
angular.module("cdsApp")
    .service("cdsApiInterceptor", function (cdsApiProvider, $rootScope) {
        "use strict";

        /**
         * @ngdoc function
         * @name request
         * @methodOf cdsApp.cdsApiInterceptor
         * @module cdsApp
         * @description
         *
         * Interception process
         *
         * @param {object} config Http config
         * @return {object} transformed http config
         */
        this.request = function (config) {
            var regex = /^\/cdsapi/;
            if (regex.test(config.url)) {
                config.url = cdsApiProvider.buildUrl(config.url.replace(regex, ""));
            }
            return config;
        };

        this.response = function (response) {
            if (response.config && (response.config.method === "POST" || response.config.method === "PUT" || response.config.method === "DELETE")) {
                $rootScope.$broadcast("refresh-warning");
            }
            return response;
        };
    });
