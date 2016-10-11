"use strict";

angular.module("cdsApp")
    .factory("ParameterService", function ParameterService () {

        var Parameter = {

            /**
             * Authenticate user and save token
             *
             * @param  {Object}   variables     - Variables list
             * @return Formated variables list
             */
            format: function (params) {
                params.forEach(function (p) {
                    p.value = p.value.toString();
                });
                return params;
            },
            unformat: function (params) {
                if (params) {
                    params.forEach(function (p, i) {
                        switch (p.type) {
                            case "number":
                                params[i].value = parseInt(p.value, 10);
                                break;
                            case "boolean":
                                params[i].value = p.value === "true";
                                break;
                        }
                    });
                }
                return params;
            }
        };

        return Parameter;
    });
