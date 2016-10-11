angular.module("cdsApp").config(function (faviconProvider) {
    "use strict";
    //faviconProvider.color = "#2192d8";
    faviconProvider.setOptions({
        color: "#2192d8",
        autoInject: true,
        type: "pie",
        successColor: "#12A556",
        failureColor: "#CC1F4A",
        border: true
    });
});