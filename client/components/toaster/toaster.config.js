"use strict";

angular.module("cdsApp").config(function (ToastProvider) {

    ToastProvider.setExtraClasses("messenger-fixed messenger-on-top messenger-on-right");
    ToastProvider.setTheme("future");

});
