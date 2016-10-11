"use strict";

angular.module("cdsApp")
    .factory("EditMode", function EditModeService ($localStorage, EDIT_MODE_LOCAL_STORAGE_KEY, $rootScope) {

        var canEdit = $localStorage[EDIT_MODE_LOCAL_STORAGE_KEY] ? $localStorage[EDIT_MODE_LOCAL_STORAGE_KEY] : false;
        var EditMode = {

            /**
             * Switch on edit mode
             */
            switchOn: function () {
                canEdit = true;
                $localStorage[EDIT_MODE_LOCAL_STORAGE_KEY] = true;
                $rootScope.$broadcast("editModeStateEvent", true);
            },

            /**
             * Switch on edit mode
             */
            switchOff: function () {
                canEdit = false;
                $localStorage[EDIT_MODE_LOCAL_STORAGE_KEY] = false;
                $rootScope.$broadcast("editModeStateEvent", false);
            },

            switch: function (newValue) {
                if (!EditMode.get() && newValue) {
                    EditMode.switchOn();
                } else if (EditMode.get() && !newValue) {
                    EditMode.switchOff();
                }
            },

            /**
             * Return state
             */
            get: function () {
                return canEdit;
            }
        };
        return EditMode;
    });
