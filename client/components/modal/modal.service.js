"use strict";

angular.module("cdsApp")
.factory("Modal", function ($rootScope, $uibModal, $translate) {

    function openModal (opts) {
        opts = opts || {};

        opts.scope = angular.extend($rootScope.$new(), opts.scope || {});

        var modalParams = angular.extend({
            templateUrl: "components/modal/modal.html",
            windowClass: "modal-default"
        }, opts);

        return $uibModal.open(modalParams);
    }

    // Public API here
    return {

        /* Default modal */
        show: function show (opts) {
            return openModal(opts).result;
        },

        /* Confirmation modals */
        confirm: {

            forceUpdate: function forceUpdateModal (type) {
                var msg = "common_msg_overwrite";
                if (type === "application") {
                    msg = "common_msg_overwrite_application";
                }
                var modal = openModal({
                    windowClass: "modal modal-alert",
                    scope: {
                        modal: {
                            dismissable: true,
                            title: $translate.instant("common_msg_overwrite_title"),
                            html: "<p>" + $translate.instant(msg, { type: type }) + "</p>",
                            buttons: [{
                                classes: "btn-danger",
                                text: "Confirm",
                                click: function (e) {
                                    modal.close(e);
                                }
                            }, {
                                classes: "btn-default",
                                text: "Cancel",
                                click: function (e) {
                                    modal.dismiss(e);
                                }
                            }]
                        }
                    }
                });

                return modal.result;
            },

            /**
             * Create a function to open a delete confirmation modal (ex. ng-click="myModalFn(name, arg1, arg2...)")
             * @param  {Function} del - callback, ran when delete is confirmed
             * @return {Function}     - the function to open the modal (ex. myModalFn)
             */
            "delete": function deleteModal (name) {

                var modal = openModal({
                    windowClass: "modal-danger",
                    scope: {
                        modal: {
                            dismissable: true,
                            title: "Confirm Delete",
                            html: "<p>Are you sure you want to delete <strong>" + name + "</strong> ?</p>",
                            buttons: [{
                                classes: "btn-danger",
                                text: "Delete",
                                click: function (e) {
                                    modal.close(e);
                                }
                            }, {
                                classes: "btn-default",
                                text: "Cancel",
                                click: function (e) {
                                    modal.dismiss(e);
                                }
                            }]
                        }
                    }
                });

                return modal.result;
            }
        }
    };
});
