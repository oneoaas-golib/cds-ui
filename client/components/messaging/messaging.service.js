"use strict";

angular.module("cdsApp")
    .factory("Messaging", function MessagingService (Toast, $translatePartialLoader, $translate) {

        var Messaging = {
            success: function (msg) {
                Toast.success(msg);
            },
            info: function (msg) {
                Toast.info(msg);
            },
            error: function (err) {
                if (err.status) {
                    if (err.status === -1) {
                        $translate("messaging_error_unreachable").then(function (value) {
                            Toast.error(value);
                        });
                    } else {
                        if (err.data) {
                            Toast.error("HTTP " + err.status + " : " + err.data.message);
                        } else {
                            Toast.error("HTTP " + err.status);
                        }

                    }
                } else {
                    Toast.error(err);
                }
            }
        };
        return Messaging;

    });
