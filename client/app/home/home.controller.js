"use strict";

angular.module("cdsApp").controller("HomeCtrl", function HomeCtrl (URLS) {

    this.name = "CDS";
    this.docs = URLS.cdsdoc;

});
