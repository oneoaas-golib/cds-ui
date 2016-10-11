"use strict";

angular.module("cdsApp").run(function (TranslateService, moment, amMoment) {

    // Set the Moment locale
    var locale = TranslateService.getUserLocale(true);
    moment.locale(locale);
    amMoment.changeLocale(locale);

});
